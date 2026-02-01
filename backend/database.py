import os

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()


class PersaDatabase:
    def __init__(self) -> None:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_KEY")
        if not url or not key:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set"
            )
        self.supabase: Client = create_client(url, key)

    def get_latest_context(self, user_id: str):
        """Fetches the most recent instructions for a user's task."""
        result = (
            self.supabase.table("user_contexts")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        return result.data[0] if result.data else None

    def create_call_record(self, user_id: str, phone_number: str, call_sid: str):
        """Initializes a new call log entry."""
        return (
            self.supabase.table("calls")
            .insert(
                {
                    "user_id": user_id,
                    "phone_number": phone_number,
                    "call_sid": call_sid,
                    "status": "in-progress",
                    "ivr_state": "start",
                }
            )
            .execute()
        )

    def update_call_result(self, call_sid: str, transcript: str, summary: str):
        """Saves the final transcript and AI-generated summary."""
        return (
            self.supabase.table("calls")
            .update(
                {
                    "transcript": transcript,
                    "summary": summary,
                    "status": "completed",
                }
            )
            .eq("call_sid", call_sid)
            .execute()
        )

    def update_ivr_state(self, call_sid: str, ivr_state: str):
        """Tracks which IVR menu level Persa is on."""
        return (
            self.supabase.table("calls")
            .update({"ivr_state": ivr_state})
            .eq("call_sid", call_sid)
            .execute()
        )
