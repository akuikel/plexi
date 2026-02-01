import asyncio
import logging
import os
import re
import time
from dataclasses import dataclass
from typing import Optional

from twilio.rest import Client as TwilioClient
from twilio.twiml.voice_response import VoiceResponse

logger = logging.getLogger("persa.ivr")


@dataclass
class IVRDecision:
    digits: Optional[str] = None
    reason: Optional[str] = None
    requires_mute: bool = False
    handoff: bool = False
    handoff_reason: Optional[str] = None


class IVRNavigator:
    def __init__(self, goal_text: str, cooldown_seconds: float = 0.75) -> None:
        self.goal_text = goal_text.lower()
        self.cooldown_seconds = cooldown_seconds
        self._last_send_at = 0.0
        self._lock = asyncio.Lock()
        self._cached_option_map = self._build_option_map()

    def _build_option_map(self) -> dict[str, str]:
        return {
            "support": "1",
            "technical support": "1",
            "billing": "2",
            "sales": "3",
            "account": "4",
            "operator": "0",
            "representative": "0",
        }

    def analyze_transcript(self, text: str) -> IVRDecision:
        lowered = text.lower()
        if self._detect_handoff(lowered):
            return IVRDecision(
                handoff=True,
                handoff_reason="live_agent_detected",
            )

        match = re.search(r"press (\d) for ([a-z\s]+)", lowered)
        if match:
            option = match.group(1)
            label = match.group(2).strip()
            if label in self._cached_option_map and self._goal_matches(label):
                return IVRDecision(
                    digits=option,
                    reason=f"matched goal '{label}'",
                    requires_mute=True,
                )

        match = re.search(r"enter your ([a-z\s]+)", lowered)
        if match:
            if "account" in match.group(1) and "account" in self.goal_text:
                return IVRDecision(
                    digits=self._extract_account_digits() or "",
                    reason="account number prompt",
                    requires_mute=True,
                )

        return IVRDecision()

    def _goal_matches(self, label: str) -> bool:
        for key in self._cached_option_map:
            if key in self.goal_text and key in label:
                return True
        return False

    def _extract_account_digits(self) -> Optional[str]:
        match = re.search(r"account number[:\s]+(\d+)", self.goal_text)
        if match:
            return f"{match.group(1)}wwww#"
        return None

    def _detect_handoff(self, text: str) -> bool:
        cues = [
            "connecting you to a representative",
            "connecting you to an agent",
            "please hold",
            "hold music",
            "connecting your call",
        ]
        return any(cue in text for cue in cues)

    async def send_digits(self, call_sid: str, digits: str) -> None:
        if not digits:
            return
        async with self._lock:
            now = time.monotonic()
            elapsed = now - self._last_send_at
            if elapsed < self.cooldown_seconds:
                await asyncio.sleep(self.cooldown_seconds - elapsed)
            await asyncio.to_thread(_twilio_send_digits, call_sid, digits)
            self._last_send_at = time.monotonic()


def _twilio_send_digits(call_sid: str, digits: str) -> None:
    account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
    auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
    if not account_sid or not auth_token:
        raise RuntimeError("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN required")
    client = TwilioClient(account_sid, auth_token)
    response = VoiceResponse()
    response.play(digits=digits)
    client.calls(call_sid).update(twiml=str(response))
    logger.info("Sent DTMF digits: %s", digits)


async def trigger_handoff_webhook(url: str, payload: dict) -> None:
    import json
    import urllib.request

    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    await asyncio.to_thread(urllib.request.urlopen, request)
