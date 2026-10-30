# Bookinada

Bookinada is a travel-booking platform for travellers planning a trip. It will support searching for and reserving flights and hotel accommodation, either independently or as a combined booking.

This is a personal learning project based on TUM's Advanced Topics of Software Engineering course (WS 2026/27). It connects lecture theory with practical software development and exam preparation.

## Planned functionality

- Search for flights and hotel accommodation.
- Reserve flights and hotels separately or together.
- View reservations, track status changes, and receive notifications.
- Recommend accommodation based on flights and flights based on accommodation preferences.
- Prevent overbooking when users compete for the same inventory.
- Handle partial failures, such as a successful flight reservation followed by a failed hotel reservation.
- Explore blockchain-based booking as an alternative backend.

## Current status

Week 1: project setup, a system-context diagram, eight functional requirements, and three quality requirements are prepared as a tutor-assisted proposal. Hotel search includes proposed acceptance scenarios for matching offers, invalid dates, and no results. Learner approval and independent peer review remain pending. No application functionality has been implemented or tested.

Week 2: the internal architecture and six initial REST operations are documented. Hotel and Flight OpenAPI 3.0.3 contracts pass local Redocly validation. Temporary fault-injection checks confirmed that unresolved schema references and warnings cause validation to fail, and restored contracts pass. A GitHub Actions workflow is prepared; its remote run and PR review remain pending. These checks do not establish application behavior or exam readiness.

## Planned technology

- Backend: TypeScript, Node.js, and NestJS
- Frontend: React and TypeScript
- Database: PostgreSQL
- API specifications: OpenAPI
- Containers: Docker and Docker Compose
- Version control and collaboration: Git and GitHub

AI recommendations and blockchain integration will be developed in later stages. Dependency versions will be selected as the project progresses.

## Documentation

- [Requirements](docs/requirements.md)
- [System context](docs/system-context.md)
- [Git workflow](docs/workflow.md)
- [Internal architecture](docs/architecture.md)
- [REST API design](docs/api-design.md)
- [Hotel OpenAPI contract](api/hotel.openapi.yaml)
- [Flight OpenAPI contract](api/flight.openapi.yaml)
- [API validation and verification](docs/api-validation.md)

## Validate API contracts

Use Node.js 22 (22.12.0 or newer) and npm 10 or newer. From the repository root:

```sh
npm ci
npm run lint:api
```

The validator fails on errors or warnings from the configured rule set. It checks the contracts, not a running implementation. The local server addresses in the contracts are proposed endpoints, not deployed services.

## Learning goals

Understand requirements, system boundaries, architecture trade-offs, database transactions, concurrency control, testing, and deployment by applying them to a working project.

This individual GitHub version adapts the course's team-based LRZ GitLab workflow. It does not substitute for the required team activities or peer review.

## Maintainer

GitHub: [ynlabs](https://github.com/ynlabs)
