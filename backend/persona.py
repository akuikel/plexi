import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

logger = logging.getLogger("persa.persona")


@dataclass
class PersonaState:
    text_prompt: str
    voice_prompt_bytes: Optional[bytes]
    voice_prompt_path: Optional[str]


class PersonaManager:
    def __init__(self, text_prompt: str, voice_prompt_path: Optional[str]) -> None:
        self.text_prompt = text_prompt
        self.voice_prompt_path = voice_prompt_path

    async def prepare(self) -> PersonaState:
        active_mode_context = "Persa Active Mode: enabled. Respond immediately."
        text_prompt = f"{self.text_prompt}\n\n{active_mode_context}"
        voice_bytes = None
        if self.voice_prompt_path:
            path = Path(self.voice_prompt_path)
            if path.exists():
                voice_bytes = path.read_bytes()
                logger.info("Loaded voice prompt from %s", path)
            else:
                logger.warning("Voice prompt not found: %s", path)
        return PersonaState(
            text_prompt=text_prompt,
            voice_prompt_bytes=voice_bytes,
            voice_prompt_path=self.voice_prompt_path,
        )
