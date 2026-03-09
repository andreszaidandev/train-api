# MBTA Pixel Arrivals Dashboard

Responsive MBTA arrivals web app built with React + Vite.

## Local setup

1. Install dependencies:
```bash
npm install
```

2. Create a local env file:
```bash
# macOS/Linux
cp .env.example .env.local

# Windows (PowerShell)
Copy-Item .env.example .env.local
```

3. Add your MBTA key to `.env.local`:
```bash
VITE_MBTA_API_KEY=your_real_key_here
```

4. Start dev server:
```bash
npm run dev
```

## Environment variables

- `VITE_MBTA_API_KEY` (optional but recommended): MBTA API key used for station and prediction requests.

The app still works without a key, but you may hit rate limits.

## Deploying to Vercel

Set the same variable in Vercel project settings:

- Key: `VITE_MBTA_API_KEY`
- Value: your MBTA key

Then redeploy.
