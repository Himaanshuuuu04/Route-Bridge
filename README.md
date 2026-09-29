# Route-Bridge

Route-Bridge is a full-stack survey traffic-routing platform that connects downstream respondent vendors with upstream survey suppliers. It provides respondent screening, secure survey redirects, transaction tracking, vendor callbacks, dashboard analytics, Redis caching, and asynchronous background processing.

## Documentation

The detailed project documentation is available in [`docs/PROJECT_DOCUMENTATION.md`](docs/PROJECT_DOCUMENTATION.md). It covers:

- System architecture and respondent lifecycle.
- Local setup and environment variables.
- Authentication and authorization.
- Domain models and API endpoints.
- Redis caching and BullMQ workers.
- Frontend structure and development commands.
- Manual end-to-end testing.
- Docker deployment, security, operations, and troubleshooting.

## Applications

- `frontend/`: Next.js, React, and TypeScript dashboard and screener application.
- `backend/`: Express, MongoDB, Redis, BullMQ, and Node.js API and redirect service.

For known risks and the current manual test procedure, see [`BUGS.md`](BUGS.md) and [`TEST.md`](TEST.md).
