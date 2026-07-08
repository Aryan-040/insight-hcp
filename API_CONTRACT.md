# API Contract — MedRep AI (HCP Module)

All endpoints are prefixed with `VITE_API_BASE_URL` (default
`http://localhost:8000/api`). Requests/responses are JSON. Errors follow
FastAPI conventions: `{ "detail": "message" }` with the matching HTTP status.

The frontend mock adapter (`src/api/mockAdapter.ts`) implements every endpoint
so the UI runs standalone. Toggle it off with `VITE_USE_MOCK=false` once
FastAPI is up.

## Shared Types

```ts
Sentiment       = "positive" | "neutral" | "negative"
InteractionType = "meeting" | "call" | "email" | "conference" | "sample_drop" | "virtual"

HCP { id, name, specialty, hospital, city, email?, phone?, tier?: "A"|"B"|"C" }
Material { id, name, type: "brochure"|"clinical_paper"|"slide_deck"|"video" }
Sample   { id, productName, quantity, batchNumber? }
FollowUpAction { id, text, dueDate?: "YYYY-MM-DD", completed?: boolean }

Interaction {
  id, hcpId, hcp?: HCP,
  type: InteractionType,
  date: "YYYY-MM-DD", time: "HH:mm",
  attendees: string[], topics: string,
  materials: Material[], samples: Sample[],
  sentiment: Sentiment,
  outcomes: string, followUps: FollowUpAction[],
  notes?, voiceNoteUrl?, summary?,
  createdAt, updatedAt,           // ISO 8601
  source: "form" | "ai"
}

InteractionDraft = Interaction minus { id, createdAt, updatedAt, hcp } (id optional for PUT)
Paginated<T> { items: T[], total, page, pageSize }
```

## `GET /dashboard` → `DashboardPayload`
```json
{
  "stats": { "todayCount":3, "weekCount":14, "pendingFollowUps":7, "activeHCPs":12, "todayDelta":12, "weekDelta":8 },
  "todaysInteractions":  [Interaction],
  "recentInteractions":  [Interaction],
  "upcomingMeetings":    [{ "id","hcpName","hcpSpecialty","type","date","time","location" }],
  "aiSuggestions":       [{ "id","hcpName","text","createdAt" }],
  "weeklyActivity":      [{ "day":"Mon","interactions":4,"followUps":2 }],
  "sentimentBreakdown":  [{ "name":"Positive","value":8 }],
  "interactionsByType":  [{ "type":"meeting","count":9 }]
}
```

## `GET /hcps?q={string}` → `Paginated<HCP>`
Case-insensitive substring match against `name`, `specialty`, `hospital`.

## `GET /interactions?q=&type=&sentiment=` → `Paginated<Interaction>`
Server returns most-recent first, `hcp` hydrated.

## `GET /interactions/{id}` → `Interaction` | 404 `{ "detail":"Not found" }`

## `POST /interactions`
- Body: `InteractionDraft`
- 201: created `Interaction` (server assigns id/createdAt/updatedAt, hydrates hcp)
- 422: Pydantic validation errors

## `PUT /interactions/{id}`
- Body: `InteractionDraft` (full replacement; path `id` wins)
- 200: updated `Interaction` — 404 if missing

## `DELETE /interactions/{id}` → `{ "success": true }` | 404

## `POST /chat`
Drives the LangGraph agent (planner → intent → tool executor → responder) with
Groq `gemma2-9b-it`.

Request:
```json
{
  "message": "Met Dr. Sharma today, discussed OncoBoost, follow-up in 2 weeks",
  "conversationId": "cv_abc123",
  "history": [{ "role": "user"|"assistant", "content": "..." }]
}
```

Response:
```json
{
  "conversationId": "cv_abc123",
  "messages": [
    { "id","role":"user","content","createdAt" },
    { "id","role":"tool","toolName":"extract_medical_entities","toolStatus":"success","content":"{...}","createdAt" },
    { "id","role":"tool","toolName":"detect_sentiment","toolStatus":"success","content":"{\"sentiment\":\"positive\"}","createdAt" },
    { "id","role":"assistant","content":"...","createdAt","extractedDraft": { ... } }
  ],
  "extractedDraft": { /* mirror of last assistant.extractedDraft — Partial<InteractionDraft> */ },
  "toolCalls": [{ "name":"extract_medical_entities","status":"success" }]
}
```

### Expected LangGraph tools (backend)

| Tool                           | Purpose                                                             |
| ------------------------------ | ------------------------------------------------------------------- |
| `log_interaction`              | Persist a new interaction (calls `POST /interactions`).             |
| `edit_interaction`             | Modify an existing one (`PUT /interactions/{id}`).                  |
| `summarize_conversation`       | Concise summary from raw notes.                                     |
| `extract_medical_entities`     | Doctor, hospital, medicine, disease, competitor, product.           |
| `suggest_follow_up`            | Recommend next-step actions.                                        |
| `search_previous_interactions` | Retrieve past interactions for context.                             |

## Errors
Non-2xx responses use `{ "detail": "message" }`. The Axios interceptor in
`src/api/client.ts` normalizes this to `{ message, status }` for slices.
