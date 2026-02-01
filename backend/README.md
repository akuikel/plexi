# Persa Voice Backend (Local)

FastAPI backend for local full-duplex testing with a Twilio-style Media Stream.

## Quick start

```bash
cd "/Users/abhiyanbikramsingh/Desktop/va/backend"
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py --host 0.0.0.0 --port 8787 --cpu-offload
```

## Local mic/speaker simulation

```bash
python client_sim.py --ws-url ws://localhost:8787/ws/twilio
```

## Environment variables

- `PERSA_MODEL_ID` (default: `nvidia/personaplex-7b-v1`)
- `PERSA_CPU_OFFLOAD` (default: `true`)
- `PERSA_ENGINE` (default: `moshi`)
- `PERSA_VOICE_PROMPT_PATH` (optional path to voice prompt audio)
- `PERSA_SAMPLE_RATE` (default: `24000`)
- `PERSA_BLOCKLIST` (comma-separated caller numbers)
- `PERSA_HANDOFF_WEBHOOK_URL` (optional webhook for live agent bridge)
- `TWILIO_ACCOUNT_SID` (required for DTMF send)
- `TWILIO_AUTH_TOKEN` (required for DTMF send)
- `PERSA_ASR_MODEL` (optional, enables ASR hook via faster-whisper)

If you have the Mimi codec available, install it separately and the backend will
auto-enable Mimi encode/decode at 24kHz. Otherwise it will fall back to PCM16.

## Twilio Function handoff

Deploy `backend/twilio_function_handoff.js` as a Twilio Function and set its URL
as `PERSA_HANDOFF_WEBHOOK_URL`. Configure these Twilio env vars:

- `PERSA_PRIMARY_NUMBER` (E.164 mobile number to ring)
- `TWILIO_DEFAULT_NUMBER` (optional fallback "from" number)

## Local handoff test endpoint

For local testing without Twilio, set:

```
PERSA_HANDOFF_WEBHOOK_URL=http://localhost:8787/handoff-test
```

Then test it:

```bash
curl -X POST http://localhost:8787/handoff-test \
  -H "Content-Type: application/json" \
  -d '{"call_sid":"CA123","reason":"live_agent_detected"}'
```
