from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Model options:
    # - "kyutai/moshiko-pytorch-bf16" (Moshi default)
    # - "kyutai/moshika-pytorch-bf16" (Moshi alternate)
    # - Any HuggingFace model ID for MLX engine
    model_id: str = "kyutai/moshiko-pytorch-bf16"
    engine: str = "moshi"  # Options: "dummy", "moshi", "mlx", "vapi"
    cpu_offload: bool = False  # Set to False for Apple Silicon (uses MPS)
    sample_rate: int = 24000  # Moshi uses 24kHz
    vapi_sample_rate: int = 16000  # Vapi uses 16kHz
    text_prompt: str = (
        "You are Persa, a helpful AI voice assistant. "
        "You make phone calls on behalf of users, navigate IVR menus, "
        "schedule appointments, and handle customer service interactions. "
        "Be concise, friendly, and efficient."
    )
    voice_prompt_path: str | None = None
    blocklist: str = ""
    handoff_webhook_url: str | None = None
    asr_model: str | None = None

    class Config:
        env_prefix = "PERSA_"
