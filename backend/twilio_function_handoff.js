// Twilio Function: Live-agent handoff bridge
// Deploy in Twilio Functions and set as the webhook target for
// PERSA_HANDOFF_WEBHOOK_URL.
//
// Required env vars in Twilio:
// - TWILIO_ACCOUNT_SID
// - TWILIO_AUTH_TOKEN
// - PERSA_PRIMARY_NUMBER (E.164 format, e.g. +14155552671)
//
// Incoming payload (from Persa backend):
// {
//   "call_sid": "<current_call_sid>",
//   "user_id": "<optional>",
//   "reason": "live_agent_detected"
// }

exports.handler = async function (context, event, callback) {
  try {
    const client = context.getTwilioClient();
    const callSid = event.call_sid;
    const primaryNumber = context.PERSA_PRIMARY_NUMBER;

    if (!callSid || !primaryNumber) {
      return callback(null, {
        status: "error",
        message: "call_sid and PERSA_PRIMARY_NUMBER required",
      });
    }

    // Create a new outbound call to the user's mobile.
    const outbound = await client.calls.create({
      to: primaryNumber,
      from: event.from_number || context.TWILIO_DEFAULT_NUMBER,
      twiml: `<Response><Say>Connecting you to Persa.</Say></Response>`,
    });

    // Bridge the original call to the new outbound leg using TwiML.
    await client.calls(callSid).update({
      twiml: `<Response><Dial>${outbound.sid}</Dial></Response>`,
    });

    return callback(null, { status: "ok", outbound_sid: outbound.sid });
  } catch (err) {
    return callback(null, { status: "error", message: err.message });
  }
};
