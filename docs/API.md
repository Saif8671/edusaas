# API Documentation

## Endpoints

### `GET /api/health`
Returns API health status.
- **Response**: `{ "status": "ok", "message": "..." }`

### `POST /api/notifications/email`
Sends an email through Resend from the backend.
- **Body**:
  - `to`: string or string[]
  - `subject`: string
  - `html`: string
  - `text`: string
  - `from`: string, optional
- **Env**:
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL` optional

### `POST /api/notifications/whatsapp`
Sends a WhatsApp message through Twilio from the backend.
- **Body**:
  - `to`: string
  - `body`: string
  - `from`: string, optional
- **Env**:
  - `TWILIO_SID`
  - `TWILIO_TOKEN`
  - `TWILIO_WHATSAPP_FROM` optional

## Integration Notes

- The frontend should call these API routes only.
- Do not call Resend or Twilio directly from client components.
- The attendance dashboard currently triggers both channels for low-attendance alerts.
- Add the provider keys in `frontend/.env.example` or your deployed environment before using the notification routes.
