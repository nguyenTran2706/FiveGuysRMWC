# Base44 Dev Environment

## Stack
Vite 6 + React 19 + TypeScript + Tailwind 4. Frontend-only; the `supabase/` directory is a backend scaffold (Edge Functions + migration) that is NOT connected in dev — no database runs in compose.

## Running
```sh
docker compose -f docker-compose.base44.yml up -d
```
- Node 22 slim image, source bind-mounted at `/app`, `npm install && npm run dev` on start.
- Vite dev server on port 5173, mapped to host port 3000. Live reload is active.
- `node_modules` lives in a named volume so installs persist across restarts.

## Workplace rights chatbot
- Knowledge base: `src/data/fairworkRights.mjs` (curated Fair Work Ombudsman content, bilingual EN/VI, one source URL per entry). Re-check sources with `node scripts/refresh-rights-kb.mjs [--write]`.
- Retrieval + refusal: `src/lib/retrieval.mjs` (shared by browser and server; below `RELEVANCE_THRESHOLD` the answer is a deterministic refusal, the model is never called).
- Answering: `src/lib/rightsAnswer.mjs` (retrieval, refusal, grounded prompt). Local dev server: `scripts/rights-api.mjs` (`POST /api/rights-chat`, proxied from Vite `/api`). Hosted: `api/rights-chat.mjs`, a serverless function that answers from the curated passages and only calls a model when `MODEL_URL` is set.
- Model (optional): self-hosted `llama.cpp` server (`model` service) running Qwen2.5-1.5B-Instruct GGUF pulled from Hugging Face into the `model_cache` volume. First boot downloads ~1 GB; until it's healthy the API returns `model_loading` (503) and the UI asks the user to retry. It is used only when `MODEL_URL` is set; otherwise answers are the curated passages verbatim. No API key or external AI service is used.

## Environment
- `VITE_CASE_SUBMIT_URL` (optional, empty by default): leave empty to use RMWC's existing clinic enquiry handoff. No external credentials are required to boot.
- Supabase secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, etc.) are server-only and only needed if the optional submit-case Edge Function is deployed — not for local dev.

## Verification
- `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/` → 200
- `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/src/main.tsx` → 200 (confirms Vite serves live source, not a prebuilt bundle)
- Preview should show the Vietnamese intro screen with a rainy street background and two entry buttons.

## Tests
```sh
docker compose -f docker-compose.base44.yml exec web node --test tests/*.test.mjs
```
