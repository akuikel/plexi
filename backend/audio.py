import logging

import numpy as np

logger = logging.getLogger("persa.audio")


class MimiCodec:
    def __init__(self, sample_rate: int = 24000) -> None:
        self.sample_rate = sample_rate
        self._codec = None
        try:
            from mimi import Mimi  # type: ignore

            self._codec = Mimi(sample_rate=sample_rate)
            logger.info("Using Mimi codec at %s Hz", sample_rate)
        except Exception:
            logger.warning("Mimi codec not available, using PCM16 passthrough")

    def encode(self, pcm16: bytes) -> bytes:
        if self._codec is None:
            return pcm16
        audio = np.frombuffer(pcm16, dtype=np.int16)
        return self._codec.encode(audio).tobytes()

    def decode(self, data: bytes) -> bytes:
        if self._codec is None:
            return data
        decoded = self._codec.decode(np.frombuffer(data, dtype=np.uint8))
        return decoded.astype(np.int16).tobytes()
