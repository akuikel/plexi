"""Text-to-Speech module using Microsoft Edge TTS."""
import asyncio
import base64
import io
import logging
from typing import AsyncIterator

logger = logging.getLogger("persa.tts")


async def text_to_speech(text: str, voice: str = "en-US-JennyNeural") -> bytes:
    """Convert text to speech using Edge TTS.
    
    Returns raw audio bytes (MP3 format).
    """
    import edge_tts
    
    communicate = edge_tts.Communicate(text, voice)
    audio_data = io.BytesIO()
    
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data.write(chunk["data"])
    
    return audio_data.getvalue()


async def text_to_speech_pcm(text: str, voice: str = "en-US-JennyNeural", sample_rate: int = 8000) -> bytes:
    """Convert text to speech and return as PCM audio.
    
    Twilio expects mulaw 8kHz audio.
    """
    import subprocess
    import tempfile
    import os
    
    # Get MP3 audio from Edge TTS
    mp3_data = await text_to_speech(text, voice)
    
    # Convert MP3 to mulaw using ffmpeg
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as mp3_file:
        mp3_file.write(mp3_data)
        mp3_path = mp3_file.name
    
    try:
        # Convert to mulaw 8kHz (Twilio's expected format)
        result = subprocess.run(
            [
                "ffmpeg", "-i", mp3_path,
                "-ar", str(sample_rate),
                "-ac", "1",
                "-f", "mulaw",
                "-"
            ],
            capture_output=True,
            timeout=30
        )
        
        if result.returncode != 0:
            logger.error("FFmpeg error: %s", result.stderr.decode())
            return b""
        
        return result.stdout
    finally:
        os.unlink(mp3_path)


async def stream_tts_to_twilio(ws, text: str, stream_sid: str, voice: str = "en-US-JennyNeural"):
    """Stream TTS audio directly to Twilio WebSocket.
    
    Args:
        ws: WebSocket connection
        text: Text to speak
        stream_sid: Twilio stream SID
        voice: Edge TTS voice name
    """
    try:
        # Get mulaw audio
        audio_data = await text_to_speech_pcm(text, voice, sample_rate=8000)
        
        if not audio_data:
            logger.error("Failed to generate TTS audio")
            return
        
        # Twilio expects audio in chunks, base64 encoded
        chunk_size = 640  # ~80ms at 8kHz mulaw
        
        for i in range(0, len(audio_data), chunk_size):
            chunk = audio_data[i:i + chunk_size]
            
            # Send media message to Twilio
            message = {
                "event": "media",
                "streamSid": stream_sid,
                "media": {
                    "payload": base64.b64encode(chunk).decode("utf-8")
                }
            }
            
            await ws.send_json(message)
            
            # Small delay to simulate real-time streaming
            await asyncio.sleep(0.08)
        
        logger.info("Finished streaming TTS for: %s...", text[:50])
        
    except Exception as e:
        logger.error("Error in stream_tts_to_twilio: %s", e)


# Available voices (some good options)
VOICES = {
    "female_us": "en-US-JennyNeural",
    "female_us_friendly": "en-US-AriaNeural", 
    "male_us": "en-US-GuyNeural",
    "female_uk": "en-GB-SoniaNeural",
    "male_uk": "en-GB-RyanNeural",
}
