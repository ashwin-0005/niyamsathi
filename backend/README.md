# NiyamSathi Backend

Express.js API server for NiyamSathi.

## Setup

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and update values:

```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Development

```bash
npm run dev     # Runs with auto-reload
```

## Production

```bash
npm start
```

## API Endpoints

- `GET /api/health` — Health check
- `GET /api/rules` — Get rules (future)
- `POST /api/compliance/check` — Check compliance (future)

## Notes

- Currently a placeholder/template
- Ready to integrate with database or external APIs
- CORS enabled for frontend communication
