# API Documentation

## Endpoints

### `GET /api/health`
Returns API health status.
- **Response**: `{ "status": "ok", "message": "..." }`

### `POST /api/study-assistant`
Generates a study-focused chat response and studio assets for the student AI notebook.
- **Body**:
  - `message`: string
  - `studentName`: string, optional
  - `course`: string, optional
  - `batch`: string, optional
  - `studio`: string, optional (`chat`, `quiz`, `flashcards`, `slide-deck`, `mind-map`, `reports`, `audio-overview`, `video-overview`, `infographic`, `data-table`)
  - `sources`: array of selected source objects, optional
  - `testTopic`: string, optional
  - `questionCount`: number, optional
- **Response**:
  - `reply`: main assistant response (Grok when configured)
  - `keyPoints`, `studySteps`, `followUps`
  - `quiz`, `flashcards`, `mindMap`, `slides`, `report`, `infographic`, `dataTable`
  - `audioScript`, `videoOutline`
  - `studioPreview`, `providers`, `demo`
- **Env**:
  - `FRONTEND_URL`
  - `XAI_API_KEY` for Grok chat replies
  - `GEMINI_API_KEY` for structured studio outputs and source summarization
  - `GROK_MODEL`, `GEMINI_MODEL` optional

### `POST /api/study-assistant/sources/summarize`
Summarizes uploaded notebook sources for the student dashboard.
- **Body**:
  - `sources`: array of `{ id, title, type, content, summary }`
- **Response**:
  - `sources`: array with generated summaries
- **Env**:
  - `GEMINI_API_KEY`

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
