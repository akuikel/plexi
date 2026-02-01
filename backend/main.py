import asyncio
import base64
import contextlib
import logging
import os
import time
from dataclasses import dataclass, field
from typing import Optional

from dotenv import load_dotenv
load_dotenv()  # Load .env file

# from fastapi import BackgroundTasks, FastAPI, WebSocket, WebSocketDisconnect
from fastapi import BackgroundTasks, FastAPI, WebSocketDisconnect
from pydantic import BaseModel, Field
from pydantic import BaseModel

# from asr import ASRSettings, ASRStream
# from audio import MimiCodec
# from engine import EngineSession, load_engine
# from ivr_handler import IVRNavigator, trigger_handoff_webhook
# from persona import PersonaManager

from settings import Settings

# Optional database import
try:
    from database import PersaDatabase
except ImportError:
    PersaDatabase = None  # type: ignore

app = FastAPI()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("persa.backend")


@app.on_event("startup")
async def startup_event():
    """Pre-load models at startup to avoid delays during calls."""
    logger.info("Pre-loading Whisper model for transcription...")
    try:
        from transcribe import get_whisper_model
        get_whisper_model()
        logger.info("Whisper model pre-loaded successfully")
    except Exception as e:
        logger.warning("Failed to pre-load Whisper: %s", e)


def get_settings() -> Settings:
    if not hasattr(app.state, "settings"):
        app.state.settings = Settings()
    return app.state.settings


# @dataclass
# class SessionState:
#     session: EngineSession
#     codec: MimiCodec
#     transcript: list[str] = field(default_factory=list)
#     speaker_task: Optional[asyncio.Task] = None
#     is_speaking: bool = False
#     last_interrupt_start: Optional[float] = None
#     muted: bool = False
#     mute_task: Optional[asyncio.Task] = None
#     navigator: Optional[IVRNavigator] = None
#     db: Optional[PersaDatabase] = None
#     call_sid: Optional[str] = None
#     user_id: Optional[str] = None
#     handoff_webhook_url: Optional[str] = None
#     asr: Optional[ASRStream] = None
#     asr_task: Optional[asyncio.Task] = None
# 
#     def configure_ivr(
#         self,
#         navigator: Optional[IVRNavigator],
#         db: Optional[PersaDatabase],
#         call_sid: Optional[str],
#         user_id: Optional[str],
#         handoff_webhook_url: Optional[str],
#         asr: Optional[ASRStream],
#     ) -> None:
#         self.navigator = navigator
#         self.db = db
#         self.call_sid = call_sid
#         self.user_id = user_id
#         self.handoff_webhook_url = handoff_webhook_url
#         self.asr = asr
# 
#     async def start_asr(self) -> None:
#         if not self.asr:
#             return
#         self.asr.start()
#         if self.asr_task and not self.asr_task.done():
#             return
#         self.asr_task = asyncio.create_task(self._asr_loop())
# 
#     async def start_speaking(self, ws: WebSocket) -> None:
#         if self.speaker_task and not self.speaker_task.done():
#             return
#         self.speaker_task = asyncio.create_task(self._speaker_loop(ws))
# 
#     async def _speaker_loop(self, ws: WebSocket) -> None:
#         try:
#             async for output in self.session.output_stream():
#                 if output.kind == "audio":
#                     if self.muted:
#                         continue
#                     if not self.is_speaking:
#                         self.is_speaking = True
#                         self.last_interrupt_start = time.perf_counter()
#                     payload = base64.b64encode(
#                         self.codec.encode(output.data)
#                     ).decode("ascii")
#                     await ws.send_json(
#                         {
#                             "event": "media",
#                             "media": {"payload": payload},
#                         }
#                     )
#                 elif output.kind == "text":
#                     self.transcript.append(output.data)
#                     await self._handle_transcript(output.data)
#                 elif output.kind == "end_of_turn":
#                     self.is_speaking = False
#         except asyncio.CancelledError:
#             raise
#         finally:
#             self.is_speaking = False
# 
#     async def barge_in(self) -> None:
#         if not self.is_speaking:
#             return
#         interrupt_start = time.perf_counter()
#         await self.session.interrupt()
#         if self.speaker_task and not self.speaker_task.done():
#             self.speaker_task.cancel()
#             with contextlib.suppress(asyncio.CancelledError):
#                 await self.speaker_task
#         latency_ms = (time.perf_counter() - interrupt_start) * 1000
#         logger.info("Interruption Response Latency: %.2f ms", latency_ms)
#         self.is_speaking = False
# 
#     async def mute_for(self, seconds: float) -> None:
#         if self.mute_task and not self.mute_task.done():
#             self.mute_task.cancel()
#             with contextlib.suppress(asyncio.CancelledError):
#                 await self.mute_task
# 
#         async def _mute_window():
#             self.muted = True
#             await asyncio.sleep(seconds)
#             self.muted = False
# 
#         self.mute_task = asyncio.create_task(_mute_window())
# 
#     async def _handle_transcript(self, text: str) -> None:
#         if not self.navigator or not self.call_sid:
#             return
#         decision = self.navigator.analyze_transcript(text)
#         if decision.handoff and self.handoff_webhook_url:
#             _schedule_background(
#                 trigger_handoff_webhook(
#                     self.handoff_webhook_url,
#                     {
#                         "call_sid": self.call_sid,
#                         "user_id": self.user_id,
#                         "reason": decision.handoff_reason,
#                     },
#                 )
#             )
#         if decision.digits:
#             await self.mute_for(1.0)
#             _schedule_background(
#                 self.navigator.send_digits(self.call_sid, decision.digits)
#             )
#             if self.db:
#                 try:
#                     self.db.update_ivr_state(self.call_sid, decision.reason or "ivr")
#                 except Exception as exc:
#                     logger.warning("Failed to update ivr_state: %s", exc)
# 
#     async def _asr_loop(self) -> None:
#         if not self.asr:
#             return
#         async for text in self.asr.transcript_stream():
#             await self._handle_transcript(text)



# class TwilioStartPayload(BaseModel):
#     streamSid: Optional[str] = None
#     callSid: Optional[str] = None
#     from_number: Optional[str] = None
#     to_number: Optional[str] = None
#     user_id: Optional[str] = None
#     phone_number: Optional[str] = None



class HandoffPayload(BaseModel):
    call_sid: str = Field(..., min_length=1)
    user_id: Optional[str] = None
    reason: Optional[str] = None


def _schedule_background(coro) -> None:
    tasks = BackgroundTasks()
    tasks.add_task(asyncio.create_task, coro)
    asyncio.create_task(tasks())


# @app.websocket("/ws/twilio")
# async def twilio_media_stream(ws: WebSocket) -> None:
#     """Handle Twilio Media Stream - supports both PersonaPlex H100 and Gemini modes."""
#     await ws.accept()
#     settings = get_settings()
#     
#     stream_sid = None
#     call_sid = None
#     engine = None
#     session = None
#     instructions = ""
#     output_task = None
#     
#     # Check if we're using a streaming engine (PersonaPlex H100 or Vapi)
#     is_streaming_engine = settings.engine.lower() in ["personaplex-h100", "vapi"]
#     
#     logger.info("Twilio WebSocket connected (engine: %s)", settings.engine)
#     
#     # For text-based engines (Gemini), we need these
#     if not is_streaming_engine:
#         from tts import stream_tts_to_twilio
#         from transcribe import transcribe_audio
#         audio_buffer = bytearray()
#         silence_frames = 0
#         is_speaking = False
#         has_speech = False
#         conversation_history = []
#         warmup_frames = 0  # Wait for greeting to finish
#         WARMUP_PERIOD = 400  # ~8 seconds to skip TTS greeting
#         SILENCE_THRESHOLD = 50  # ~1 second of silence
#         MIN_AUDIO_FOR_TRANSCRIPTION = 3000  # ~0.4 seconds of speech minimum
#     
#     try:
#         # Initialize AI engine
#         engine = load_engine(settings)
#         persona_manager = PersonaManager(
#             text_prompt=settings.text_prompt,
#             voice_prompt_path=settings.voice_prompt_path,
#         )
#         persona_state = await persona_manager.prepare()
#         session = await engine.start_session(persona_state)
#         logger.info("AI session initialized (%s)", "Streaming" if is_streaming_engine else "Text-based")
#         
#         # For Streaming engines, we use synchronous process_audio (no background task needed)
#         
#         while True:
#             msg = await ws.receive_json()
#             event = msg.get("event")
#             
#             if event == "start":
#                 start_payload = msg.get("start", {})
#                 stream_sid = start_payload.get("streamSid")
#                 call_sid = start_payload.get("callSid")
#                 custom_params = start_payload.get("customParameters", {})
#                 instructions = custom_params.get("instructions", "")
#                 
#                 logger.info("Stream started: stream=%s call=%s", stream_sid, call_sid)
#                 logger.info("Ready to process audio (mode: %s)", 
#                            "full-duplex" if is_streaming_engine else "turn-based")
#                 
#             elif event == "media":
#                 media = msg.get("media", {})
#                 payload = media.get("payload", "")
#                 
#                 if payload:
#                     audio_chunk = base64.b64decode(payload)
#                     
#                     if is_streaming_engine:
#                         # Streaming Engine: Stream audio in real-time
#                         # Use 'async for' to relay each chunk as it arrives from the engine
#                         async for ai_voice_chunk in session.process_audio(audio_chunk):
#                             if ai_voice_chunk and stream_sid:
#                                 # Send to Twilio instantly for real-time playback
#                                 msg = {
#                                     "event": "media",
#                                     "streamSid": stream_sid,
#                                     "media": {"payload": base64.b64encode(ai_voice_chunk).decode()}
#                                 }
#                                 await ws.send_json(msg)
#                     else:
#                         # Text-based (Gemini): Buffer and transcribe
#                         if is_speaking:
#                             continue
#                         
#                         # Warmup period - skip audio while greeting plays
#                         warmup_frames += 1
#                         if warmup_frames < WARMUP_PERIOD:
#                             if warmup_frames == 1:
#                                 logger.info("Waiting for greeting to finish (%d frames)...", WARMUP_PERIOD)
#                             if warmup_frames == WARMUP_PERIOD - 1:
#                                 logger.info("Greeting finished, now listening for user speech")
#                             continue
#                         
#                         # Calculate audio energy - look for deviation from mulaw silence (0xFF = 255)
#                         # In mulaw, 0xFF is silence, speech has lower byte values
#                         min_val = min(audio_chunk) if audio_chunk else 255
#                         max_val = max(audio_chunk) if audio_chunk else 255
#                         
#                         # Speech detection: significant activity below 0xFF
#                         # Speech has min values well below 200
#                         is_speech = min_val < 100  # Clear speech indicator
#                         
#                         if is_speech:
#                             silence_frames = 0
#                             has_speech = True
#                             audio_buffer.extend(audio_chunk)
#                             if len(audio_buffer) % 8000 < 200:  # Log every ~1 second
#                                 logger.info("Recording speech: %d bytes (min=%d)", 
#                                            len(audio_buffer), min_val)
#                         else:
#                             silence_frames += 1
#                             # Still buffer a bit of silence for context
#                             if has_speech and silence_frames < 20:
#                                 audio_buffer.extend(audio_chunk)
#                             
#                             # Process after silence threshold
#                             if has_speech and len(audio_buffer) > MIN_AUDIO_FOR_TRANSCRIPTION and silence_frames > SILENCE_THRESHOLD:
#                                 logger.info("=== Processing %d bytes of audio after %d silence frames ===", 
#                                            len(audio_buffer), silence_frames)
#                                 
#                                 user_text = await transcribe_audio(bytes(audio_buffer), is_mulaw=True)
#                                 
#                                 if user_text and len(user_text.strip()) > 1:
#                                     logger.info("USER SAID: '%s'", user_text)
#                                     
#                                     try:
#                                         full_input = user_text
#                                         if instructions and len(conversation_history) == 0:
#                                             full_input = f"[Call purpose: {instructions}] User says: {user_text}"
#                                         
#                                         logger.info("Sending to AI: %s", full_input[:100])
#                                         response = await session.push_text(full_input)
#                                         
#                                         if response:
#                                             logger.info("AI RESPONSE: '%s'", response[:150])
#                                             conversation_history.append({"role": "user", "content": user_text})
#                                             conversation_history.append({"role": "assistant", "content": response})
#                                             
#                                             logger.info("Speaking response via TTS...")
#                                             is_speaking = True
#                                             await stream_tts_to_twilio(ws, response, stream_sid)
#                                             is_speaking = False
#                                             logger.info("TTS complete, ready for next input")
#                                         else:
#                                             logger.warning("AI returned empty response")
#                                     except Exception as e:
#                                         logger.error("Error getting AI response: %s", e, exc_info=True)
#                                         is_speaking = True
#                                         await stream_tts_to_twilio(ws, "I'm sorry, could you repeat that?", stream_sid)
#                                         is_speaking = False
#                                 else:
#                                     logger.info("Transcription returned empty or too short: '%s'", user_text)
#                                 
#                                 audio_buffer.clear()
#                                 silence_frames = 0
#                                 has_speech = False
#                         
#             elif event == "stop":
#                 logger.info("Call ended: %s", call_sid)
#                 break
#                 
#             elif event == "mark":
#                 logger.debug("Mark event received")
#                 
#             else:
#                 logger.debug("Unknown event: %s", event)
#                 
#     except WebSocketDisconnect:
#         logger.info("WebSocket disconnected")
#     except Exception as e:
#         logger.error("WebSocket error: %s", e, exc_info=True)
#     finally:
#         if output_task:
#             output_task.cancel()
#             with contextlib.suppress(asyncio.CancelledError):
#                 await output_task
#         if session:
#             await session.close()
#         logger.info("Twilio call cleanup complete")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    phone_number: Optional[str] = None


class CallInitiateRequest(BaseModel):
    user_id: str
    phone_number: str
    instructions: str


# @app.post("/chat")
# async def chat_endpoint(request: ChatRequest) -> dict:
#     """Simple text chat with PersonaPlex (no voice)."""
#     settings = get_settings()
#     
#     try:
#         engine = load_engine(settings)
#         persona_manager = PersonaManager(
#             text_prompt=settings.text_prompt,
#             voice_prompt_path=settings.voice_prompt_path,
#         )
#         persona_state = await persona_manager.prepare()
#         session = await engine.start_session(persona_state)
#         
#         # Send the user's message as text input
#         await session.push_text(request.message)
#         
#         # Collect the response
#         response_text = []
#         async for output in session.output_stream():
#             if output.kind == "text":
#                 response_text.append(output.data)
#             elif output.kind == "end_of_turn":
#                 break
#         
#         await session.close()
#         
#         return {
#             "success": True,
#             "response": " ".join(response_text) if response_text else "I'm ready to help you make calls. What would you like me to do?",
#             "user_id": request.user_id,
#         }
#     except Exception as exc:
#         logger.error("Chat error: %s", exc)
#         return {
#             "success": False,
#             "response": f"I apologize, but I encountered an error: {str(exc)}",
#             "error": str(exc),
#         }



@app.post("/call/initiate")
async def initiate_call(request: CallInitiateRequest) -> dict:
    """Initiate an outbound call using Vapi (no Twilio)."""
    settings = get_settings()
    
    try:
        import aiohttp
        import os
        
        vapi_private_key = os.getenv("VAPI_PRIVATE_KEY")
        vapi_assistant_id = os.getenv("VAPI_ASSISTANT_ID")
        vapi_phone_number_id = os.getenv("VAPI_PHONE_NUMBER_ID")
        
        if not all([vapi_private_key, vapi_assistant_id, vapi_phone_number_id]):
            return {
                "success": False,
                "error": "Vapi credentials not configured. Please set VAPI_PRIVATE_KEY, VAPI_ASSISTANT_ID, and VAPI_PHONE_NUMBER_ID.",
            }
        
        # Prepare Vapi payload - Transient Assistant
        # We define the assistant inline to ensure no previous context/prompt leaks
        payload = {
            "phoneNumberId": vapi_phone_number_id,
            "customer": {
                "number": request.phone_number,
            },
            "assistant": {
                "firstMessage": f"Hello! This is Persa. I'm calling to help with: {request.instructions}. Is this a good time to talk?",
                "model": {
                    "provider": "openai",
                    "model": "gpt-4o",
                    "messages": [
                        {
                            "role": "system",
                            "content": f"You are Persa, a helpful AI voice assistant. You are making an outbound call. Your goal for this call is: {request.instructions}. Be concise, friendly, and conversational. Do not make up information. If the user asks who you are, say you are Persa."
                        }
                    ]
                },
                "voice": {
                    "provider": "11labs",
                    "voiceId": "burt"
                },
                "transcriber": {
                    "provider": "deepgram",
                    "model": "nova-2",
                    "language": "en-US"
                }
            }
        }
        
        headers = {
            "Authorization": f"Bearer {vapi_private_key}",
            "Content-Type": "application/json"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post("https://api.vapi.ai/call", json=payload, headers=headers) as resp:
                if resp.status != 201:
                    error_text = await resp.text()
                    logger.error("Vapi call failed: %s %s", resp.status, error_text)
                    return {
                        "success": False,
                        "error": f"Vapi API error: {error_text}",
                    }
                
                data = await resp.json()
                call_id = data.get("id")
                
                # Store instructions in database if available
                db = None
                try:
                    db = PersaDatabase()
                    db.create_call_record(request.user_id, request.phone_number, call_id)
                except Exception as exc:
                    logger.warning("Database not available: %s", exc)
                
                logger.info("Vapi call initiated: ID=%s to=%s", call_id, request.phone_number)
                
                return {
                    "success": True,
                    "call_sid": call_id,
                    "status": "queued",
                    "message": f"Call initiated to {request.phone_number} via Vapi",
                }

    except Exception as exc:
        logger.error("Call initiation error: %s", exc)
        return {
            "success": False,
            "error": str(exc),
        }


@app.post("/handoff-test")
async def handoff_test(payload: HandoffPayload) -> dict:
    logger.info(
        "Handoff test received: call_sid=%s reason=%s",
        payload.call_sid,
        payload.reason,
    )
    return {"status": "ok", "call_sid": payload.call_sid}


if __name__ == "__main__":
    import argparse
    import os

    import uvicorn

    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8787)
    parser.add_argument("--cpu-offload", action="store_true")
    parser.add_argument("--engine", default=None)
    parser.add_argument("--model-id", default=None)
    args = parser.parse_args()

    if args.cpu_offload:
        os.environ["PERSA_CPU_OFFLOAD"] = "true"
    if args.engine:
        os.environ["PERSA_ENGINE"] = args.engine
    if args.model_id:
        os.environ["PERSA_MODEL_ID"] = args.model_id

    uvicorn.run("main:app", host=args.host, port=args.port, reload=False)
