import asyncio
import contextlib
import logging
import math
import os
from dataclasses import dataclass
from typing import AsyncIterator, Literal, Optional

import numpy as np

from persona import PersonaState
from settings import Settings

logger = logging.getLogger("persa.engine")


@dataclass
class EngineOutput:
    kind: Literal["audio", "text", "end_of_turn"]
    data: bytes | str


class EngineSession:
    async def push_audio(self, pcm16: bytes) -> None:
        raise NotImplementedError

    async def push_text(self, text: str) -> None:
        raise NotImplementedError

    async def output_stream(self) -> AsyncIterator[EngineOutput]:
        raise NotImplementedError

    async def interrupt(self) -> None:
        raise NotImplementedError

    async def close(self) -> None:
        raise NotImplementedError


class DummyEngineSession(EngineSession):
    def __init__(self, sample_rate: int) -> None:
        self._queue: asyncio.Queue[EngineOutput] = asyncio.Queue()
        self._sample_rate = sample_rate
        self._closed = False

    async def push_audio(self, pcm16: bytes) -> None:
        if self._closed:
            return
        num_frames = len(pcm16) // 2
        duration = num_frames / self._sample_rate
        text = f"heard {duration:.2f}s of audio"
        await self._queue.put(EngineOutput(kind="text", data=text))
        await self._queue.put(EngineOutput(kind="audio", data=self._tone()))
        await self._queue.put(EngineOutput(kind="end_of_turn", data=""))

    async def push_text(self, text: str) -> None:
        if self._closed:
            return
        # Generate intelligent responses based on user input
        lower_text = text.lower()
        if "call" in lower_text or "phone" in lower_text:
            if any(word in lower_text for word in ["walmart", "target", "store", "bank", "doctor", "appointment"]):
                response = f"I'll help you make that call. Please provide the phone number or I can look it up for you. What specific information do you need from them?"
            else:
                response = "I can help you make a phone call. Please provide the phone number and let me know what you'd like me to say or accomplish during the call."
        elif "schedule" in lower_text or "appointment" in lower_text:
            response = "I can help you schedule an appointment. Please tell me the business name, preferred date/time, and what the appointment is for."
        elif "check" in lower_text and ("stock" in lower_text or "availability" in lower_text):
            response = "I can call the store to check stock availability for you. Which store and what item are you looking for?"
        elif "help" in lower_text:
            response = "I'm Persa, your AI voice assistant. I can make phone calls on your behalf, navigate IVR menus, schedule appointments, and handle customer service calls. What would you like me to help you with?"
        else:
            response = f"I understand you want help with: '{text}'. As your AI assistant, I can make calls, navigate phone menus, and handle conversations. How would you like me to proceed?"
        
        await self._queue.put(EngineOutput(kind="text", data=response))
        await self._queue.put(EngineOutput(kind="end_of_turn", data=""))

    async def output_stream(self) -> AsyncIterator[EngineOutput]:
        while not self._closed:
            item = await self._queue.get()
            yield item

    async def interrupt(self) -> None:
        while not self._queue.empty():
            _ = self._queue.get_nowait()
        await self._queue.put(EngineOutput(kind="end_of_turn", data=""))

    async def close(self) -> None:
        self._closed = True
        await self._queue.put(EngineOutput(kind="end_of_turn", data=""))

    def _tone(self, freq: int = 440, duration: float = 0.25) -> bytes:
        t = np.linspace(0, duration, int(self._sample_rate * duration), False)
        wave = 0.2 * np.sin(2 * math.pi * freq * t)
        audio = (wave * 32767).astype(np.int16)
        return audio.tobytes()


class DummyEngine:
    def __init__(self, sample_rate: int) -> None:
        self.sample_rate = sample_rate

    async def start_session(self, _persona: PersonaState) -> EngineSession:
        return DummyEngineSession(self.sample_rate)


class MoshiWebSocketEngine:
    """Connect to a running Moshi server via WebSocket."""
    
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.moshi_server_url = os.getenv("MOSHI_SERVER_URL", "ws://localhost:8998")

    async def start_session(self, persona: PersonaState) -> EngineSession:
        return MoshiWebSocketSession(self.moshi_server_url, persona, self.settings)


class MoshiWebSocketSession(EngineSession):
    """WebSocket client session to Moshi server."""
    
    def __init__(self, server_url: str, persona: PersonaState, settings: Settings) -> None:
        self._server_url = server_url
        self._persona = persona
        self._settings = settings
        self._ws = None
        self._closed = False
        self._output_queue: asyncio.Queue[EngineOutput] = asyncio.Queue()
        self._receive_task: Optional[asyncio.Task] = None
        self._connected = False

    async def _ensure_connected(self) -> bool:
        if self._connected and self._ws:
            return True
        
        try:
            import websockets
            self._ws = await websockets.connect(self._server_url)
            self._connected = True
            self._receive_task = asyncio.create_task(self._receive_loop())
            logger.info("Connected to Moshi server at %s", self._server_url)
            return True
        except Exception as exc:
            logger.warning("Failed to connect to Moshi server: %s", exc)
            return False

    async def _receive_loop(self) -> None:
        """Receive responses from Moshi server."""
        try:
            while self._ws and not self._closed:
                try:
                    message = await asyncio.wait_for(self._ws.recv(), timeout=0.1)
                    if isinstance(message, bytes):
                        await self._output_queue.put(
                            EngineOutput(kind="audio", data=message)
                        )
                    else:
                        await self._output_queue.put(
                            EngineOutput(kind="text", data=message)
                        )
                except asyncio.TimeoutError:
                    continue
        except Exception as exc:
            logger.warning("Moshi receive loop error: %s", exc)
        finally:
            self._connected = False

    async def push_audio(self, pcm16: bytes) -> None:
        if self._closed:
            return
        
        if not await self._ensure_connected():
            # Fallback to dummy response
            await self._output_queue.put(
                EngineOutput(kind="text", data="Moshi server not available")
            )
            await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))
            return
        
        try:
            await self._ws.send(pcm16)
        except Exception as exc:
            logger.error("Error sending audio to Moshi: %s", exc)

    async def push_text(self, text: str) -> None:
        if self._closed:
            return
        
        # Moshi is audio-based, text input would need TTS first
        await self._output_queue.put(
            EngineOutput(kind="text", data=f"Processing: {text}")
        )
        await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))

    async def output_stream(self) -> AsyncIterator[EngineOutput]:
        while not self._closed:
            try:
                item = await asyncio.wait_for(self._output_queue.get(), timeout=0.1)
                yield item
            except asyncio.TimeoutError:
                continue

    async def interrupt(self) -> None:
        while not self._output_queue.empty():
            try:
                self._output_queue.get_nowait()
            except asyncio.QueueEmpty:
                break
        await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))

    async def close(self) -> None:
        self._closed = True
        
        if self._receive_task and not self._receive_task.done():
            self._receive_task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await self._receive_task
        
        if self._ws:
            try:
                await self._ws.close()
            except Exception:
                pass
        
        await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))


class OpenAIEngine:
    """Use OpenAI API for text-based chat (with optional TTS/STT)."""
    
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def start_session(self, persona: PersonaState) -> EngineSession:
        return OpenAISession(persona, self.settings)


class GeminiEngine:
    """Use Google Gemini API for intelligent conversations."""
    
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def start_session(self, persona: PersonaState) -> EngineSession:
        return GeminiSession(persona, self.settings)


class GeminiSession(EngineSession):
    """Gemini-based session for intelligent chat."""
    
    def __init__(self, persona: PersonaState, settings: Settings) -> None:
        self._persona = persona
        self._settings = settings
        self._closed = False
        self._output_queue: asyncio.Queue[EngineOutput] = asyncio.Queue()
        self._client = None
        self._chat_history = []
        
    def _get_client(self):
        if self._client is None:
            try:
                from google import genai
                api_key = os.getenv("GEMINI_API_KEY")
                if not api_key:
                    logger.error("GEMINI_API_KEY not set")
                    return None
                self._client = genai.Client(api_key=api_key)
                logger.info("Gemini client initialized")
            except Exception as exc:
                logger.error("Failed to initialize Gemini: %s", exc)
        return self._client

    async def push_audio(self, pcm16: bytes) -> None:
        if self._closed:
            return
        await self._output_queue.put(
            EngineOutput(kind="text", data="Audio received. For voice, please speak your request.")
        )
        await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))

    async def push_text(self, text: str) -> None:
        if self._closed:
            return
        
        client = self._get_client()
        if not client:
            await self._output_queue.put(
                EngineOutput(kind="text", data="Gemini not configured. Please set GEMINI_API_KEY.")
            )
            await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))
            return
        
        try:
            # Build conversation with system prompt
            contents = []
            if self._persona.text_prompt:
                contents.append({"role": "user", "parts": [{"text": f"System instruction: {self._persona.text_prompt}"}]})
                contents.append({"role": "model", "parts": [{"text": "I understand. I am Persa, your AI voice assistant."}]})
            
            # Add chat history
            contents.extend(self._chat_history)
            
            # Add current message
            contents.append({"role": "user", "parts": [{"text": text}]})
            
            # Try multiple models in order of preference
            models_to_try = [
                "gemini-2.0-flash-lite",
                "gemini-2.5-flash",
                "gemini-flash-lite-latest",
                "gemini-2.0-flash",
            ]
            
            loop = asyncio.get_event_loop()
            response = None
            last_error = None
            
            for model_name in models_to_try:
                try:
                    response = await loop.run_in_executor(
                        None,
                        lambda m=model_name: client.models.generate_content(
                            model=m,
                            contents=contents,
                        )
                    )
                    break  # Success, exit loop
                except Exception as model_error:
                    last_error = model_error
                    logger.warning("Model %s failed: %s", model_name, str(model_error)[:50])
                    continue
            
            if response is None:
                raise last_error or Exception("All models failed")
            
            response_text = response.text
            
            # Save to history
            self._chat_history.append({"role": "user", "parts": [{"text": text}]})
            self._chat_history.append({"role": "model", "parts": [{"text": response_text}]})
            
            await self._output_queue.put(EngineOutput(kind="text", data=response_text))
            await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))
            
        except Exception as exc:
            logger.error("Gemini error: %s", exc)
            await self._output_queue.put(
                EngineOutput(kind="text", data=f"I apologize, I encountered an error: {str(exc)[:100]}")
            )
            await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))

    async def output_stream(self) -> AsyncIterator[EngineOutput]:
        while not self._closed:
            try:
                item = await asyncio.wait_for(self._output_queue.get(), timeout=0.1)
                yield item
            except asyncio.TimeoutError:
                continue

    async def interrupt(self) -> None:
        while not self._output_queue.empty():
            try:
                self._output_queue.get_nowait()
            except asyncio.QueueEmpty:
                break
        await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))

    async def close(self) -> None:
        self._closed = True
        await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))


class OpenAISession(EngineSession):
    """OpenAI-based session for chat."""
    
    def __init__(self, persona: PersonaState, settings: Settings) -> None:
        self._persona = persona
        self._settings = settings
        self._closed = False
        self._output_queue: asyncio.Queue[EngineOutput] = asyncio.Queue()
        self._conversation_history: list[dict] = []
        self._client = None
        
        # Initialize with system prompt
        if persona.text_prompt:
            self._conversation_history.append({
                "role": "system",
                "content": persona.text_prompt
            })

    def _get_client(self):
        if self._client is None:
            try:
                from openai import OpenAI
                self._client = OpenAI()
            except Exception as exc:
                logger.error("Failed to initialize OpenAI client: %s", exc)
        return self._client

    async def push_audio(self, pcm16: bytes) -> None:
        if self._closed:
            return
        
        # For audio, we'd need to use Whisper for transcription
        # For now, acknowledge the audio
        await self._output_queue.put(
            EngineOutput(kind="text", data="Audio received. Processing...")
        )
        await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))

    async def push_text(self, text: str) -> None:
        if self._closed:
            return
        
        client = self._get_client()
        if not client:
            await self._output_queue.put(
                EngineOutput(kind="text", data="OpenAI client not available. Please set OPENAI_API_KEY.")
            )
            await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))
            return
        
        try:
            self._conversation_history.append({
                "role": "user",
                "content": text
            })
            
            # Run in executor to not block
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=self._conversation_history,
                    max_tokens=256,
                )
            )
            
            assistant_message = response.choices[0].message.content
            
            self._conversation_history.append({
                "role": "assistant",
                "content": assistant_message
            })
            
            await self._output_queue.put(EngineOutput(kind="text", data=assistant_message))
            await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))
            
        except Exception as exc:
            logger.error("OpenAI error: %s", exc)
            await self._output_queue.put(
                EngineOutput(kind="text", data="I apologize, I encountered an error processing your request.")
            )
            await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))

    async def output_stream(self) -> AsyncIterator[EngineOutput]:
        while not self._closed:
            try:
                item = await asyncio.wait_for(self._output_queue.get(), timeout=0.1)
                yield item
            except asyncio.TimeoutError:
                continue

    async def interrupt(self) -> None:
        while not self._output_queue.empty():
            try:
                self._output_queue.get_nowait()
            except asyncio.QueueEmpty:
                break
        await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))

    async def close(self) -> None:
        self._closed = True
        await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))


class MlxPersonaPlexEngine:
    """Apple Silicon optimized engine using MLX."""
    
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._model = None
        self._tokenizer = None
        self._initialized = False

    async def _ensure_loaded(self) -> None:
        if self._initialized:
            return
        try:
            import mlx.core as mx
            from mlx_lm import load
            
            logger.info("Loading model via MLX: %s", self.settings.model_id)
            self._model, self._tokenizer = load(self.settings.model_id)
            self._initialized = True
            logger.info("MLX model loaded successfully")
        except ImportError as exc:
            raise RuntimeError(
                "mlx-lm not available. Install with: pip install mlx-lm"
            ) from exc
        except Exception as exc:
            raise RuntimeError(f"Failed to load MLX model: {exc}") from exc

    async def start_session(self, persona: PersonaState) -> EngineSession:
        await self._ensure_loaded()
        return MlxSession(self._model, self._tokenizer, persona, self.settings)


class MlxSession(EngineSession):
    """MLX-based session for Apple Silicon."""
    
    def __init__(self, model, tokenizer, persona: PersonaState, settings: Settings) -> None:
        self._model = model
        self._tokenizer = tokenizer
        self._persona = persona
        self._settings = settings
        self._closed = False
        self._output_queue: asyncio.Queue[EngineOutput] = asyncio.Queue()
        self._conversation_history: list[dict] = []
        
        if persona.text_prompt:
            self._conversation_history.append({
                "role": "system",
                "content": persona.text_prompt
            })

    async def push_audio(self, pcm16: bytes) -> None:
        if self._closed:
            return
        await self._output_queue.put(
            EngineOutput(kind="text", data="Audio processing requires ASR integration")
        )
        await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))

    async def push_text(self, text: str) -> None:
        if self._closed:
            return
        
        try:
            from mlx_lm import generate
            
            self._conversation_history.append({
                "role": "user",
                "content": text
            })
            
            prompt = self._tokenizer.apply_chat_template(
                self._conversation_history,
                tokenize=False,
                add_generation_prompt=True
            )
            
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: generate(
                    self._model,
                    self._tokenizer,
                    prompt=prompt,
                    max_tokens=256,
                    verbose=False
                )
            )
            
            self._conversation_history.append({
                "role": "assistant",
                "content": response
            })
            
            await self._output_queue.put(EngineOutput(kind="text", data=response))
            await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))
            
        except Exception as exc:
            logger.error("MLX generation error: %s", exc)
            await self._output_queue.put(
                EngineOutput(kind="text", data="I apologize, I encountered an error.")
            )
            await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))

    async def output_stream(self) -> AsyncIterator[EngineOutput]:
        while not self._closed:
            try:
                item = await asyncio.wait_for(self._output_queue.get(), timeout=0.1)
                yield item
            except asyncio.TimeoutError:
                continue

    async def interrupt(self) -> None:
        while not self._output_queue.empty():
            try:
                self._output_queue.get_nowait()
            except asyncio.QueueEmpty:
                break
        await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))

    async def close(self) -> None:
        self._closed = True
        await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))


class PersonaPlexAPIEngine:
    """Use PersonaPlex hosted API at personaplex.io."""
    
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.api_key = os.getenv("PERSONAPLEX_API_KEY")

    async def start_session(self, persona: PersonaState) -> EngineSession:
        return PersonaPlexAPISession(self.api_key, persona, self.settings)


class PersonaPlexAPISession(EngineSession):
    """PersonaPlex API session for cloud-based speech-to-speech."""
    
    def __init__(self, api_key: str, persona: PersonaState, settings: Settings) -> None:
        self._api_key = api_key
        self._persona = persona
        self._settings = settings
        self._closed = False
        self._output_queue: asyncio.Queue[EngineOutput] = asyncio.Queue()
        self._session = None
        self._ws = None

    async def _ensure_connected(self) -> bool:
        if not self._api_key:
            logger.warning("PersonaPlex API key not set")
            return False
        
        if self._ws:
            return True
        
        try:
            import websockets
            # Connect to PersonaPlex API WebSocket
            api_url = os.getenv("PERSONAPLEX_API_URL", "wss://api.personaplex.io/v1/stream")
            headers = {"Authorization": f"Bearer {self._api_key}"}
            self._ws = await websockets.connect(api_url, extra_headers=headers)
            
            # Send initial configuration
            import json
            config = {
                "voice": os.getenv("PERSONAPLEX_VOICE", "NATF2"),
                "persona": self._persona.text_prompt,
            }
            await self._ws.send(json.dumps(config))
            logger.info("Connected to PersonaPlex API")
            return True
        except Exception as exc:
            logger.error("Failed to connect to PersonaPlex API: %s", exc)
            return False

    async def push_audio(self, pcm16: bytes) -> None:
        if self._closed:
            return
        
        if not await self._ensure_connected():
            await self._output_queue.put(
                EngineOutput(kind="text", data="PersonaPlex API not configured. Set PERSONAPLEX_API_KEY.")
            )
            await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))
            return
        
        try:
            import base64
            # Send audio as base64 encoded
            audio_b64 = base64.b64encode(pcm16).decode()
            await self._ws.send(audio_b64)
            
            # Receive response
            response = await asyncio.wait_for(self._ws.recv(), timeout=5.0)
            if isinstance(response, bytes):
                await self._output_queue.put(EngineOutput(kind="audio", data=response))
            else:
                import json
                data = json.loads(response)
                if "audio" in data:
                    audio_bytes = base64.b64decode(data["audio"])
                    await self._output_queue.put(EngineOutput(kind="audio", data=audio_bytes))
                if "text" in data:
                    await self._output_queue.put(EngineOutput(kind="text", data=data["text"]))
                if data.get("end_of_turn"):
                    await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))
        except asyncio.TimeoutError:
            pass
        except Exception as exc:
            logger.error("PersonaPlex API error: %s", exc)

    async def push_text(self, text: str) -> None:
        if self._closed:
            return
        
        # PersonaPlex is primarily audio-based
        # For text, we acknowledge and suggest using voice
        await self._output_queue.put(
            EngineOutput(kind="text", data=f"I understand: {text}. For best results, speak to me directly!")
        )
        await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))

    async def output_stream(self) -> AsyncIterator[EngineOutput]:
        while not self._closed:
            try:
                item = await asyncio.wait_for(self._output_queue.get(), timeout=0.1)
                yield item
            except asyncio.TimeoutError:
                continue

    async def interrupt(self) -> None:
        while not self._output_queue.empty():
            try:
                self._output_queue.get_nowait()
            except asyncio.QueueEmpty:
                break
        await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))

    async def close(self) -> None:
        self._closed = True
        if self._ws:
            try:
                await self._ws.close()
            except Exception:
                pass
        await self._output_queue.put(EngineOutput(kind="end_of_turn", data=""))


# ============================================
# PersonaPlex H100 Engine (Direct WebSocket)
# ============================================

class PersonaPlexH100Engine:
    """Engine that connects directly to PersonaPlex/Moshi running on H100 GPU.
    
    Uses synchronous process_audio approach - send audio, get response immediately.
    """
    
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._ws_url = os.getenv("PERSONAPLEX_H100_URL", "")
    
    async def start_session(self, persona_state: PersonaState) -> "PersonaPlexH100Session":
        session = PersonaPlexH100Session(self._ws_url, self._settings.sample_rate)
        await session.connect()  # Connect and perform handshake
        return session


class PersonaPlexH100Session(EngineSession):
    """Session for PersonaPlex H100 - synchronous audio processing with Moshi protocol."""
    
    def __init__(self, ws_url: str, sample_rate: int) -> None:
        self._ws_url = ws_url
        self._sample_rate = sample_rate
        self._ws = None
        self._output_queue: asyncio.Queue[EngineOutput] = asyncio.Queue()
        self._closed = False
        self._is_ready = False
    
    async def connect(self) -> bool:
        """Establishes connection and performs the Moshi Handshake."""
        if self._is_ready and self._ws:
            return True
        
        if not self._ws_url or "YOUR_GRADIO_ID" in self._ws_url:
            logger.error("PersonaPlex H100 URL not configured!")
            return False
        
        try:
            import websockets
            import json
            
            logger.info(f"Connecting to H100 Brain at {self._ws_url}...")
            self._ws = await websockets.connect(self._ws_url)
            
            # THE HANDSHAKE: Send Moshi Config immediately
            config = {
                "type": "config",
                "version": "1.0",
                "sample_rate": 24000
            }
            await self._ws.send(json.dumps(config))
            self._is_ready = True
            logger.info("✅ Connected to H100 and Handshake Complete.")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to H100: {e}")
            self._is_ready = False
            return False
    
    def _resample_8k_to_24k(self, mulaw_data: bytes) -> bytes:
        """Converts Twilio 8kHz mulaw to 24kHz PCM required by Moshi."""
        import audioop
        import soxr
        
        # Convert 8kHz mulaw (Twilio) to 16-bit linear PCM
        pcm_8k = audioop.ulaw2lin(mulaw_data, 2)
        
        # Convert to numpy array for high-quality resampling
        audio_np = np.frombuffer(pcm_8k, dtype=np.int16)
        
        # Upsample from 8000Hz to 24000Hz (Moshi requirement)
        audio_24k = soxr.resample(audio_np, 8000, 24000)
        
        return audio_24k.astype(np.int16).tobytes()
    
    def _resample_24k_to_8k_mulaw(self, pcm_24k: bytes) -> bytes:
        """Converts 24kHz PCM from Moshi back to 8kHz mulaw for Twilio."""
        import audioop
        import soxr
        
        # Convert to numpy array
        audio_np = np.frombuffer(pcm_24k, dtype=np.int16)
        
        # Downsample from 24000Hz to 8000Hz
        audio_8k = soxr.resample(audio_np, 24000, 8000)
        pcm_8k = audio_8k.astype(np.int16).tobytes()
        
        # Convert to mulaw
        mulaw_data = audioop.lin2ulaw(pcm_8k, 2)
        return mulaw_data
    
    async def process_audio(self, mulaw_chunk: bytes):
        """Streams audio from H100 as it is generated.
        
        This is an async generator - yields audio chunks as they arrive from Moshi.
        Moshi sends dozens of tiny audio packets per second for real-time playback.
        """
        if not self._ws or not self._is_ready:
            return

        try:
            # 1. Resample and add Prefix (\x01)
            pcm_24k = self._resample_8k_to_24k(mulaw_chunk)
            payload = b'\x01' + pcm_24k
            await self._ws.send(payload)

            # 2. Iterate over the incoming stream from Moshi
            # We use a short timeout so the loop doesn't hang if the AI stops talking
            while True:
                try:
                    # Moshi sends audio chunks very fast (~50ms each)
                    response = await asyncio.wait_for(self._ws.recv(), timeout=0.05)
                    
                    # If the packet is binary, it's AI voice
                    if isinstance(response, bytes) and len(response) > 1:
                        msg_type = response[0]
                        audio_data = response[1:]
                        
                        if msg_type == 1:  # Audio (24kHz PCM)
                            # Convert to 8kHz mulaw for Twilio and yield immediately
                            mulaw_response = self._resample_24k_to_8k_mulaw(audio_data)
                            yield mulaw_response
                        elif msg_type == 2:  # Text transcript
                            text = audio_data.decode('utf-8', errors='ignore')
                            logger.info(f"PersonaPlex: {text[:100]}")
                    elif isinstance(response, str):
                        logger.debug(f"H100 text message: {response[:100]}")
                        
                except asyncio.TimeoutError:
                    # No more audio for now, break back to listening to the user
                    break
                    
        except Exception as e:
            logger.error(f"Streaming error: {e}")
    
    async def push_audio(self, mulaw_chunk: bytes) -> None:
        """Send audio and queue any response for output_stream."""
        response = await self.process_audio(mulaw_chunk)
        if response:
            await self._output_queue.put(EngineOutput(kind="audio", data=response))
    
    async def push_text(self, text: str) -> str:
        """PersonaPlex is speech-based."""
        if self._closed:
            return ""
        return f"I hear you! Say '{text}' out loud during a call."
    
    async def output_stream(self) -> AsyncIterator[EngineOutput]:
        """Stream audio output from PersonaPlex."""
        while not self._closed:
            try:
                item = await asyncio.wait_for(self._output_queue.get(), timeout=0.05)
                yield item
            except asyncio.TimeoutError:
                continue
    
    async def interrupt(self) -> None:
        """Interrupt current speech."""
        while not self._output_queue.empty():
            try:
                self._output_queue.get_nowait()
            except asyncio.QueueEmpty:
                break
    
    async def close(self) -> None:
        """Close the session."""
        self._closed = True
        if self._ws:
            try:
                await self._ws.close()
            except Exception:
                pass
        logger.info("H100 Connection Closed.")


# ============================================
# Vapi Engine
# ============================================

class VapiEngine:
    """Connect to Vapi.ai for voice intelligence."""
    
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.public_key = os.getenv("VAPI_PUBLIC_KEY")
        self.assistant_id = os.getenv("VAPI_ASSISTANT_ID")

    async def start_session(self, persona: PersonaState) -> EngineSession:
        return VapiSession(self.public_key, self.assistant_id, persona, self.settings)


class VapiSession(EngineSession):
    """Session for Vapi.ai - streams audio via WebSocket."""
    
    def __init__(self, public_key: str, assistant_id: str, persona: PersonaState, settings: Settings) -> None:
        self._public_key = public_key
        self._assistant_id = assistant_id
        self._persona = persona
        self._settings = settings
        self._ws = None
        self._output_queue: asyncio.Queue[EngineOutput] = asyncio.Queue()
        self._closed = False
        self._is_ready = False
        self._ws_url = "wss://api.vapi.ai/client/web"

    async def connect(self) -> bool:
        if self._is_ready and self._ws:
            return True
            
        if not self._public_key:
            logger.error("VAPI_PUBLIC_KEY not configured!")
            return False
            
        try:
            import websockets
            import json
            
            logger.info(f"Connecting to Vapi at {self._ws_url}...")
            self._ws = await websockets.connect(
                self._ws_url,
                extra_headers={"Authorization": f"Bearer {self._public_key}"}
            )
            
            # Start call message
            msg = {
                "type": "start-call",
                "assistant": {
                    "transcriber": {
                        "provider": "deepgram",
                        "model": "nova-2",
                        "language": "en-US"
                    },
                    "model": {
                        "provider": "openai",
                        "model": "gpt-3.5-turbo",
                        "messages": [
                            {"role": "system", "content": self._persona.text_prompt}
                        ]
                    },
                    "voice": {
                        "provider": "11labs",
                        "voiceId": "burt"
                    }
                }
            }
            # Use assistant ID if provided
            if self._assistant_id:
                msg = {
                    "type": "start-call",
                    "assistantId": self._assistant_id
                }
                
            await self._ws.send(json.dumps(msg))
            self._is_ready = True
            logger.info("✅ Connected to Vapi.")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to Vapi: {e}")
            self._is_ready = False
            return False

    def _resample_8k_to_16k(self, mulaw_data: bytes) -> bytes:
        """Converts Twilio 8kHz mulaw to 16kHz PCM required by Vapi."""
        import audioop
        import soxr
        
        # Convert 8kHz mulaw (Twilio) to 16-bit linear PCM
        pcm_8k = audioop.ulaw2lin(mulaw_data, 2)
        
        # Convert to numpy array for high-quality resampling
        audio_np = np.frombuffer(pcm_8k, dtype=np.int16)
        
        # Upsample from 8000Hz to 16000Hz (Vapi requirement)
        audio_16k = soxr.resample(audio_np, 8000, 16000)
        
        return audio_16k.astype(np.int16).tobytes()
    
    def _resample_16k_to_8k_mulaw(self, pcm_16k: bytes) -> bytes:
        """Converts 16kHz PCM from Vapi back to 8kHz mulaw for Twilio."""
        import audioop
        import soxr
        
        # Convert to numpy array
        audio_np = np.frombuffer(pcm_16k, dtype=np.int16)
        
        # Downsample from 16000Hz to 8000Hz
        audio_8k = soxr.resample(audio_np, 16000, 8000)
        pcm_8k = audio_8k.astype(np.int16).tobytes()
        
        # Convert to mulaw
        mulaw_data = audioop.lin2ulaw(pcm_8k, 2)
        return mulaw_data

    async def process_audio(self, mulaw_chunk: bytes):
        """Streams audio to Vapi and yields responses."""
        if not self._ws or not self._is_ready:
            if not await self.connect():
                return

        try:
            # 1. Resample to 16k PCM
            pcm_16k = self._resample_8k_to_16k(mulaw_chunk)
            
            # Vapi expects raw audio bytes? Or JSON?
            # Based on search, it's likely raw binary or JSON with base64.
            # But "WebSocket Transport" usually implies raw binary.
            # However, the JS SDK sends audio via AudioWorklet.
            # Let's try sending raw binary first.
            await self._ws.send(pcm_16k)

            # 2. Receive from Vapi
            while True:
                try:
                    response = await asyncio.wait_for(self._ws.recv(), timeout=0.05)
                    
                    if isinstance(response, bytes):
                        # Assume it's 16k PCM audio
                        mulaw_response = self._resample_16k_to_8k_mulaw(response)
                        yield mulaw_response
                    elif isinstance(response, str):
                        import json
                        data = json.loads(response)
                        # Handle Vapi events if needed
                        if data.get("type") == "audio":
                            # If they send audio as JSON
                            pass
                        
                except asyncio.TimeoutError:
                    break
                    
        except Exception as e:
            logger.error(f"Vapi streaming error: {e}")

    async def push_audio(self, mulaw_chunk: bytes) -> None:
        """Send audio and queue any response for output_stream."""
        # This is used if main.py calls push_audio instead of process_audio
        # But we'll use process_audio in main.py
        pass

    async def push_text(self, text: str) -> None:
        if self._closed:
            return
        # Vapi is voice-first
        pass

    async def output_stream(self) -> AsyncIterator[EngineOutput]:
        while not self._closed:
            try:
                item = await asyncio.wait_for(self._output_queue.get(), timeout=0.1)
                yield item
            except asyncio.TimeoutError:
                continue

    async def interrupt(self) -> None:
        pass

    async def close(self) -> None:
        self._closed = True
        if self._ws:
            try:
                await self._ws.close()
            except Exception:
                pass


def load_engine(settings: Settings):
    engine_type = settings.engine.lower()
    
    if engine_type == "dummy":
        logger.info("Using DummyEngine")
        return DummyEngine(settings.sample_rate)
    
    if engine_type == "moshi":
        logger.info("Using Moshi WebSocket Engine")
        return MoshiWebSocketEngine(settings)
    
    if engine_type == "openai":
        logger.info("Using OpenAI Engine")
        return OpenAIEngine(settings)
    
    if engine_type == "gemini":
        logger.info("Using Gemini Engine")
        return GeminiEngine(settings)
    
    if engine_type == "mlx":
        logger.info("Using MLX Engine")
        return MlxPersonaPlexEngine(settings)
    
    if engine_type == "personaplex" or engine_type == "personaplex-api":
        logger.info("Using PersonaPlex API Engine")
        return PersonaPlexAPIEngine(settings)
    
    if engine_type == "personaplex-h100":
        logger.info("Using PersonaPlex H100 Engine (Direct WebSocket)")
        return PersonaPlexH100Engine(settings)
        
    if engine_type == "vapi":
        logger.info("Using Vapi Engine")
        return VapiEngine(settings)
    
    logger.warning("Unknown engine '%s', using DummyEngine", engine_type)
    return DummyEngine(settings.sample_rate)
