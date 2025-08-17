# Scheduler Microservice

A simple job scheduler built with NestJS and PostgreSQL.

## Quick Start

```bash
npm install
npm run start:dev
```

## API

- `GET /health` - Health check
- `GET /jobs` - List all jobs
- `POST /jobs` - Create new job
- `GET /jobs/:id` - Get specific job
- `PATCH /jobs/:id` - Update job
- `DELETE /jobs/:id` - Delete job


## TODO

- Add proper error handling
- Add job execution logging
- Add authentication
