# API Documentation

## Endpoints

### `GET /api/health`
Returns API health status.
- **Response**: `{ "status": "ok", "message": "..." }`

### `POST /api/study-assistant`
Generates a study-focused chat response and studio preview for the student dashboard.
- **Body**:
  - `message`: string
  - `studentName`: string, optional
  - `course`: string, optional
  - `batch`: string, optional
  - `studio`: string, optional
  - `sources`: array of selected source objects, optional
- **Response**:
  - `reply`: main assistant response
  - `keyPoints`: short revision takeaways
  - `studySteps`: suggested learning steps
  - `followUps`: quick follow-up prompts
  - `studioPreview`: generated studio summary
- **Env**:
  - `FRONTEND_URL`

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
- The student AI study assistant calls the Express backend at `/api/study-assistant` using `NEXT_PUBLIC_BACKEND_URL`.
- Add the provider keys in `frontend/.env.example` or your deployed environment before using the notification routes.
