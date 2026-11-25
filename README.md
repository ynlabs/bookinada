# Bookinada

Bookinada is a travel-booking platform for searching and reserving flights and hotels, either independently or as a combined booking.

This is a personal learning project based on TUM's Advanced Topics in Software Engineering course (WS 2026/27).

## Planned functionality

- Search and reserve flights and hotels.
- Manage reservations and receive status updates.
- Recommend flights and accommodation.
- Prevent overbooking through concurrency control.
- Handle partial failures in combined bookings.
- Explore blockchain-based booking.

## Current status

- Requirements and system architecture documented.
- Initial Hotel and Flight REST APIs defined using OpenAPI 3.0.3.
- Both API contracts pass local Python-based validation.
- GitHub Actions workflow updated for automated API validation. Remote verification is pending.

## Technology stack

- Backend: Python, FastAPI
- Database: PostgreSQL (planned)
- API specification: OpenAPI
- Dependency management: pip, venv
- Containerization: Docker, Docker Compose (planned)
- CI: GitHub Actions
- Version control: Git, GitHub

## Project setup

Create and activate a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install development dependencies:

```bash
python -m pip install -r requirements-dev.txt
```

## API validation

Run from the repository root:

```bash
python scripts/validate_api.py
```

The script validates the OpenAPI contracts in the `api/` directory using `openapi-spec-validator`.

API validation is also configured in `.github/workflows/api-validation.yml`.

These checks validate the API specifications, not the runtime behaviour of the services.

## Documentation

- [Requirements](docs/requirements.md)
- [System context](docs/system-context.md)
- [Architecture](docs/architecture.md)
- [API design](docs/api-design.md)
- [API validation](docs/api-validation.md)
- [Git workflow](docs/workflow.md)

## Course context

This project adapts the course's team-based GitLab workflow for individual development on GitHub. It does not replace mandatory course activities or tool-specific requirements.

## Maintainer

[ynlabs](https://github.com/ynlabs)
