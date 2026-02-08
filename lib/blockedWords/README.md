# Blocked words (content moderation)

Word lists used by `lib/contentModeration.js` to detect vulgar, spammy, or reportable text.

- **en.js** – English terms (vulgar, obscene, common spam phrases).
- **romanUrdu.js** – Roman Urdu / chat Urdu (Latin script, e.g. WhatsApp style).

## Editing lists

- One term per array entry, lowercase.
- Add or remove terms as needed; the app uses these lists without restart.
- Word-boundary matching is used (e.g. "classic" won’t match "ass").

## Where moderation runs

- **Valentine links:** recipient name, email subject/body, welcome text, main message, button labels, reply label (create/update + reply from public page).
- **New Year resolutions:** title and description (create/update).
- **API:** `POST /api/moderation/check` (auth required) for client-side checks; response does not reveal which words were found.
