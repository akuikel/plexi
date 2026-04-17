import asyncio
import logging
from dataclasses import dataclass
from typing import AsyncIterator, Optional

import numpy as np

logger = logging.getLogger("persa.asr")


@dataclass
class ASRSettings:
    model_name: Optional[str] = None
    sample_rate: int = 16000
    chunk_seconds: float = 2.0


class ASRStream:
    def __init__(self, settings: ASRSettings) -> None:
        self.settings = settings
        self._queue: asyncio.Queue[bytes] = asyncio.Queue()
        self._text_queue: asyncio.Queue[str] = asyncio.Queue()
        self._task: Optional[asyncio.Task] = None
        self._enabled = bool(settings.model_name)

    def start(self) -> None:
        if not self._enabled or self._task:
            return
        self._task = asyncio.create_task(self._run())

    async def close(self) -> None:
        if self._task and not self._task.done():
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

    async def push_audio(self, pcm16: bytes) -> None:
        if not self._enabled:
            return
        await self._queue.put(pcm16)

    async def transcript_stream(self) -> AsyncIterator[str]:
        while True:
            text = await self._text_queue.get()
            yield text

    async def _run(self) -> None:
        try:
            from faster_whisper import WhisperModel  # type: ignore
        except Exception as exc:
            logger.warning("ASR disabled: faster-whisper not available (%s)", exc)
            return

        model = WhisperModel(self.settings.model_name, device="cpu")
        buffer: list[bytes] = []
        target_bytes = int(self.settings.sample_rate * 2 * self.settings.chunk_seconds)

        while True:
            chunk = await self._queue.get()
            buffer.append(chunk)
            size = sum(len(part) for part in buffer)
            if size < target_bytes:
                continue
            audio = b"".join(buffer)
            buffer.clear()

            samples = np.frombuffer(audio, dtype=np.int16).astype(np.float32) / 32768.0
            segments, _info = model.transcribe(samples, language="en")
            text = " ".join(segment.text.strip() for segment in segments).strip()
            if text:
                await self._text_queue.put(text)
