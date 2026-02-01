"""Audio transcription using faster-whisper."""
import asyncio
import io
import logging
import tempfile
import subprocess
import os
from typing import Optional

logger = logging.getLogger("persa.transcribe")

# Global whisper model (lazy loaded)
_whisper_model = None


def get_whisper_model():
    """Get or initialize the Whisper model."""
    global _whisper_model
    if _whisper_model is None:
        from faster_whisper import WhisperModel
        logger.info("Loading Whisper model (tiny.en)...")
        # Use tiny.en for fast transcription - good enough for phone calls
        _whisper_model = WhisperModel("tiny.en", device="cpu", compute_type="int8")
        logger.info("Whisper model loaded")
    return _whisper_model


def mulaw_to_pcm16(mulaw_data: bytes, input_rate: int = 8000, output_rate: int = 16000) -> bytes:
    """Convert mulaw audio to PCM16 using ffmpeg.
    
    Args:
        mulaw_data: Raw mulaw audio bytes
        input_rate: Input sample rate (Twilio uses 8000)
        output_rate: Output sample rate (Whisper needs 16000)
    
    Returns:
        PCM16 audio bytes at output_rate
    """
    if not mulaw_data:
        return b""
    
    # Write mulaw to temp file
    with tempfile.NamedTemporaryFile(suffix=".raw", delete=False) as f:
        f.write(mulaw_data)
        mulaw_path = f.name
    
    try:
        # Convert mulaw to PCM16 using ffmpeg
        result = subprocess.run(
            [
                "ffmpeg", "-y",
                "-f", "mulaw",
                "-ar", str(input_rate),
                "-ac", "1",
                "-i", mulaw_path,
                "-ar", str(output_rate),
                "-ac", "1",
                "-f", "s16le",
                "-acodec", "pcm_s16le",
                "-"
            ],
            capture_output=True,
            timeout=10
        )
        
        if result.returncode != 0:
            logger.error("FFmpeg error: %s", result.stderr.decode()[:200])
            return b""
        
        return result.stdout
    except Exception as e:
        logger.error("Error converting audio: %s", e)
        return b""
    finally:
        os.unlink(mulaw_path)


async def transcribe_audio(audio_data: bytes, is_mulaw: bool = True) -> Optional[str]:
    """Transcribe audio to text using faster-whisper.
    
    Args:
        audio_data: Raw audio bytes (mulaw 8kHz from Twilio, or PCM16)
        is_mulaw: Whether input is mulaw format
    
    Returns:
        Transcribed text or None if failed
    """
    if not audio_data or len(audio_data) < 1000:
        logger.debug("Audio too short for transcription")
        return None
    
    try:
        # Convert mulaw to PCM16 if needed
        if is_mulaw:
            pcm_data = mulaw_to_pcm16(audio_data)
        else:
            pcm_data = audio_data
        
        if not pcm_data:
            return None
        
        # Write to temp WAV file for whisper
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            wav_path = f.name
        
        # Create WAV file with header
        result = subprocess.run(
            [
                "ffmpeg", "-y",
                "-f", "s16le",
                "-ar", "16000",
                "-ac", "1",
                "-i", "pipe:0",
                "-f", "wav",
                wav_path
            ],
            input=pcm_data,
            capture_output=True,
            timeout=10
        )
        
        if result.returncode != 0:
            logger.error("FFmpeg WAV error: %s", result.stderr.decode()[:200])
            os.unlink(wav_path)
            return None
        
        # Transcribe with whisper
        loop = asyncio.get_event_loop()
        model = get_whisper_model()
        
        def do_transcribe():
            segments, info = model.transcribe(wav_path, beam_size=1)
            text = " ".join(segment.text for segment in segments).strip()
            return text
        
        text = await loop.run_in_executor(None, do_transcribe)
        os.unlink(wav_path)
        
        if text:
            logger.info("Transcribed: %s", text[:100])
        
        return text if text else None
        
    except Exception as e:
        logger.error("Transcription error: %s", e)
        return None
