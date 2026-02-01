import argparse
import asyncio
import base64
import json
import logging

import sounddevice as sd
import websockets


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("persa.client_sim")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--ws-url", required=True)
    parser.add_argument("--sample-rate", type=int, default=24000)
    parser.add_argument("--chunk-ms", type=int, default=20)
    return parser.parse_args()


async def run(ws_url: str, sample_rate: int, chunk_ms: int) -> None:
    block_size = int(sample_rate * (chunk_ms / 1000))
    loop = asyncio.get_running_loop()
    input_queue: asyncio.Queue[bytes] = asyncio.Queue()
    output_queue: asyncio.Queue[bytes] = asyncio.Queue()

    def on_input(indata, _frames, _time, status):
        if status:
            logger.warning("Input status: %s", status)
        loop.call_soon_threadsafe(input_queue.put_nowait, bytes(indata))

    def on_output(outdata, frames, _time, status):
        if status:
            logger.warning("Output status: %s", status)
        try:
            chunk = output_queue.get_nowait()
        except asyncio.QueueEmpty:
            outdata[:] = b"\x00" * len(outdata)
            return
        if len(chunk) < len(outdata):
            chunk += b"\x00" * (len(outdata) - len(chunk))
        outdata[:] = chunk[: len(outdata)]

    async with websockets.connect(ws_url) as ws:
        await ws.send(
            json.dumps(
                {
                    "event": "start",
                    "start": {"streamSid": "local", "callSid": "local"},
                }
            )
        )

        async def send_audio():
            while True:
                chunk = await input_queue.get()
                payload = base64.b64encode(chunk).decode("ascii")
                await ws.send(
                    json.dumps({"event": "media", "media": {"payload": payload}})
                )

        async def recv_audio():
            async for message in ws:
                data = json.loads(message)
                if data.get("event") == "media":
                    payload = data.get("media", {}).get("payload", "")
                    if payload:
                        output_queue.put_nowait(base64.b64decode(payload))

        with sd.RawInputStream(
            samplerate=sample_rate,
            channels=1,
            dtype="int16",
            blocksize=block_size,
            callback=on_input,
        ), sd.RawOutputStream(
            samplerate=sample_rate,
            channels=1,
            dtype="int16",
            blocksize=block_size,
            callback=on_output,
        ):
            await asyncio.gather(send_audio(), recv_audio())


def main() -> None:
    args = parse_args()
    asyncio.run(run(args.ws_url, args.sample_rate, args.chunk_ms))


if __name__ == "__main__":
    main()
