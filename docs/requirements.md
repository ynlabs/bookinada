# Bookinada Product Requirements

- Status: Draft — pending review
- Last updated: 2026-11-23

This document defines the expected product behaviour, business rules, quality targets, assumptions, and acceptance criteria for Bookinada. It is a requirements baseline proposal; inclusion here does not establish implementation or successful verification. Numerical quality targets remain proposed until reviewed and measured.

## 1. Product goal and stakeholders

Bookinada enables travellers to find and reserve flights and accommodation, independently or as a combined trip, and to understand the current outcome of their reservations.

| Stakeholder | Need or responsibility |
| --- | --- |
| Traveller | Find suitable offers, reserve travel, and receive accurate booking information. |
| Business management | Define product priorities and explore an alternative smart-contract booking backend. |
| Maintainer | Deliver, test, operate, and evolve the application. |

## 2. Scope and document boundaries

### Product scope

- Flight and accommodation search and offer details.
- Independent flight and accommodation reservations.
- Combined booking coordination and outcome reporting.
- Recommendations in both directions: flight to accommodation and accommodation preferences to flight.
- Reservation status/history and in-app status notifications.
- A future alternative booking backend based on smart contracts (C1).

### Current operating assumptions

The initial implementation uses synthetic inventory and test travellers. Each flight reservation requests one seat; each accommodation reservation requests one room of a single room type for the entire stay. Real supplier integrations, payment processing, email/SMS delivery, and external AI providers are not established dependencies. Authentication, cancellations, pricing, retries, and recovery policies require the decisions in section 9 before their behaviour can be treated as agreed.

### Related specifications

| Document | Responsibility |
| --- | --- |
| [System context](system-context.md) | System boundary, users, and external dependencies. |
| [Architecture](architecture.md) | Internal responsibilities, dependencies, and implementation decisions. |
| [API design](api-design.md) | HTTP operations, request/response behaviour, and error conventions. |
| [Hotel OpenAPI](../api/hotel.openapi.yaml) | Machine-readable Hotel API contract. |
| [Flight OpenAPI](../api/flight.openapi.yaml) | Machine-readable Flight API contract. |
| [API validation](api-validation.md) | Contract validation procedure and recorded tool-check evidence. |

Requirements describe required outcomes. API contracts describe the interface through which those outcomes are exposed. Changes affecting either must be checked against the other; a discrepancy is a decision to resolve, not permission to silently change the behaviour. Contract linting alone does not verify product behaviour.

## 3. Functional requirements

FR1–FR8 retain their existing identifiers. The course project scenario provides the high-level capabilities; A1–A9 and the current API proposals refine the initial operating scope. The status of these refinements is Draft.

### FR1 — Search flights

The system shall allow travellers to search available flight offers by origin, destination, and departure date.

- Search results shall match the supplied criteria and have available seats.
- A valid search with no matching available offers shall return an empty result.
- Invalid search input shall be rejected with a validation error.
- Searching shall not reserve seats or guarantee later booking success.

Basis: flight-search capability in the project scenario; A2 and A9; current Flight API proposal. Route normalization, field formats, and HTTP responses are specified in the API contract.

### FR2 — Search accommodation

The system shall allow travellers to search available accommodation by destination, check-in date, and check-out date.

- Destination and both dates are required; the destination shall not be blank and dates shall be valid calendar dates.
- Check-out shall be strictly after check-in.
- The stay includes the check-in night and excludes the check-out date. For example, 2026-11-07 to 2026-11-09 requires availability on the nights of 7 and 8 November.
- Each returned offer shall match the destination and have one room of the same room type available for every occupied night.
- A valid search with no matching offer shall return an empty result and indicate that no matching accommodation is available.
- Invalid input shall produce a validation error, not a successful empty result.
- Searching shall not create a reservation or consume inventory. Availability shall be checked again when a reservation is created.

Basis: accommodation-search capability; A2. Acceptance: AC6–AC8. Occupancy, multiple-room requests, destination matching, and pricing remain open decisions.

### FR3 — Reserve a flight independently

The system shall allow travellers to reserve an available flight without requiring an accommodation reservation.

- The initial request identifies a scheduled flight offer and a test traveller, as defined in the Flight API proposal and A8–A9.
- The service shall recheck current seat availability when processing the request.
- Success shall create a reservation with a reservation identifier and confirmed status, and consume one seat.
- Invalid input, an unknown offer, or unavailable capacity shall be rejected without creating a reservation or consuming inventory for that request.
- Reservation creation and inventory changes shall satisfy NFR2 and BR3.

Basis: independent flight reservation; current Flight API proposal. Successful and rejected reservation scenarios still need explicit acceptance coverage.

### FR4 — Reserve accommodation independently

The system shall allow travellers to reserve available accommodation without requiring a flight reservation.

- The initial request identifies a test traveller, accommodation offer, check-in date, and check-out date, as defined in the Hotel API proposal and A8.
- The stay-date rules in FR2 shall apply.
- The service shall recheck availability of the offer's room type for every occupied night.
- Success shall create a reservation with a reservation identifier and confirmed status, and consume one room of that room type for each occupied night.
- Invalid input, an unknown offer, or insufficient capacity on any occupied night shall be rejected without creating a reservation or consuming inventory for that request.
- Reservation creation and inventory changes shall satisfy NFR2, BR1, and BR3.

Basis: independent accommodation reservation; A2; current Hotel API proposal. Acceptance includes AC1–AC2; successful creation and the individual rejection cases require additional scenarios.

### FR5 — Coordinate a combined booking

The system shall allow travellers to request a combined flight-and-accommodation booking and view its outcome.

- The combined booking shall be reported as confirmed only when both reservations are confirmed.
- A pending or unsuccessful component shall not be presented as a fully confirmed trip.
- If only one component succeeds, the system shall expose a recoverable outcome. Compensation, recovery deadlines, and terminal failure handling remain OD5.

Basis: combined booking and distributed failures. Acceptance: AC3; related invariant: BR2.

### FR6 — Recommend travel options

The system shall recommend accommodation for a selected flight and flights for supplied accommodation preferences.

These are two separately testable directions. Required inputs, relevance criteria, ranking, and evaluation data remain OD3. This requirement does not select a model or external AI provider; provider selection is OD7.

Basis: recommendations in the project scenario. Acceptance scenarios are pending refinement.

### FR7 — View reservations and status history

The system shall allow travellers to view their reservations, current reservation statuses, and recorded status changes.

The initial scope does not yet define editing or cancellation behaviour (OD1). Ownership enforcement requires OD4. The event history and the set of visible states require refinement before acceptance tests can be finalized.

Basis: reservation management and change tracking. Acceptance scenarios are pending refinement.

### FR8 — Notify reservation owners of status changes

When a reservation's status changes, the system shall provide an in-app notification to the traveller who owns that reservation.

- The notification shall include the reservation identifier, previous status, and new status.
- Another traveller shall not receive that reservation's notification.
- Delivery timing and duplicate handling require refinement; production ownership depends on OD4.

Basis: status notifications; A4. Acceptance: AC9.

## 4. Business rules and invariants

| ID | Invariant | Applies to |
| --- | --- | --- |
| BR1 | For each hotel, room type, and occupied date, active reservations shall not exceed sellable capacity. Inventory shall never become negative. | Accommodation reservations, including every night of a multi-night stay. |
| BR2 | A confirmed combined booking shall have both a confirmed flight reservation and a confirmed accommodation reservation. | Combined booking outcomes. |
| BR3 | A failed local booking transaction shall neither consume inventory nor leave a committed reservation. | Flight and Hotel local booking operations. |

A lock, database transaction, or messaging pattern is a possible implementation mechanism. These rules define the required outcome rather than prescribing a specific mechanism. The Flight API proposal also requires seat inventory to remain non-negative; flight-specific concurrency scenarios remain a coverage gap.

## 5. Quality requirements

### NFR1 — Usability

**Target:** At least 90% of first-time users shall complete a hotel reservation independently within five minutes under the following test conditions.

**Verification:** Run a usability test with 10 first-time participants. Start on the hotel search page, provide a prepared test identity and available accommodation, and finish when reservation confirmation is displayed. Provide no facilitator hints. At least 9 of 10 participants must succeed within five minutes (AC4).

**Rationale:** Travellers should be able to complete the booking flow without training.

**Target status:** Proposed under A5. This small formative sample does not establish the success rate of the wider user population.

### NFR2 — Reliable and consistent booking outcomes

The following guarantees shall be verified separately:

1. **Local atomicity:** Inventory changes and reservation creation within one booking database shall either succeed together or leave no partial changes (BR3; AC2).
2. **Combined outcome consistency:** A combined booking shall not be reported as confirmed unless both component reservations are confirmed (BR2; AC3).

**Rationale:** Failures must not silently consume inventory or misrepresent booking outcomes.

A transaction in one service does not automatically cover another service's database. Cross-service recovery and compensation remain OD5. Initial in-memory implementations can be checked for their defined behaviour, but do not establish database rollback or crash-durability guarantees.

### NFR3 — Hotel-search performance

**Target:** Hotel-search API response time shall have a 95th percentile of at most two seconds under the benchmark below.

| Benchmark condition | Value |
| --- | --- |
| Dataset | 100 seeded hotel offers. |
| Load | 10 concurrent virtual users. |
| Dependencies | No network calls to external suppliers. |
| Application state | Warmed application. |
| Warm-up | 100 requests, excluded from the measured sample. |
| Measured sample | 1,000 requests after warm-up. |
| Report | Hardware, environment/configuration, request mix, response-time distribution, throughput, and error count. |

Failed measured requests shall remain visible in the report. A run that does not complete the searches correctly cannot establish product acceptance solely by returning fast errors. The request mix, client timeout, load-generation settings, and precise pass/fail treatment of errors must be fixed before the benchmark is accepted (OD10).

**Rationale:** Search latency affects the booking experience.

**Target status:** Proposed under A6; a local API benchmark, not a production SLA or an end-to-end user-experience target.

## 6. Future compatibility constraint

### C1 — Alternative smart-contract booking backend

The system shall support exploration of smart-contract-based flight and accommodation reservations as an alternative backend while preserving traveller-facing booking behaviour.

The initial experiment assumes a separate local/test blockchain network (A3). Interface substitution rules, supported failure behaviour, and contract-parity verification remain to be defined. This is a planned extension, not an implemented integration.

## 7. Acceptance scenarios

The scenarios below define expected outcomes. Execution evidence is not recorded here; a scenario's presence is not a passed test. Dates in fixtures are fixed test data, not an agreed policy allowing reservations in the past (OD2).

### AC1 — Concurrent accommodation reservations

- **Given:** Exactly one sellable room for a fixed hotel, room type, and date, with no cancellations or injected faults.
- **When:** Ten concurrent valid requests with distinct request identifiers attempt to reserve it.
- **Then:** Exactly one succeeds, nine receive a sold-out business response, remaining inventory is zero, and exactly one active reservation exists.
- **Traces to:** FR4, BR1.

### AC2 — Local rollback

- **Given:** Inventory is one and no reservation exists in the booking database under test.
- **When:** A failure is injected after the inventory update but before the reservation write, within the same local transaction.
- **Then:** Inventory remains one and no committed reservation exists.
- **Traces to:** FR3/FR4 local persistence behaviour, NFR2, BR3. Exercise independently for each service when database persistence is implemented.

### AC3 — Partial combined booking

- **Given:** A combined booking is requested.
- **When:** The flight reservation succeeds but the accommodation reservation fails.
- **Then:** The system does not display a confirmed combined booking and exposes a recoverable outcome. The recovery policy and deadline remain OD5; this scenario does not yet establish completed compensation.
- **Traces to:** FR5, NFR2, BR2.

### AC4 — First-time-user booking

- **Given:** The participant setup and task conditions in NFR1.
- **When:** Participants attempt a hotel reservation without facilitator hints.
- **Then:** At least 9 of 10 finish within five minutes; individual outcomes and completion times are recorded.
- **Traces to:** NFR1.

### AC5 — Independent inventory operations

- **Given:** Two bookings address distinct inventory records and one holds its inventory lock.
- **When:** The second booking is processed.
- **Then:** It can proceed without waiting for an application-wide booking lock solely because the first operation is active.
- **Traces to:** Later concurrency-design evaluation. The applicable inventory granularity, controllable schedule, and timing criterion remain OD9; this is not yet a finalized acceptance gate.

### AC6 — Accommodation search matching

- **Given:** Only these offers exist: Hotel A in Munich has one room of a single room type available on both 2026-11-07 and 2026-11-08; Hotel B in Berlin is available on both nights; Hotel C in Munich has no availability on 2026-11-08.
- **When:** A traveller searches Munich, with check-in 2026-11-07 and check-out 2026-11-09.
- **Then:** Only Hotel A is returned. Hotel B is excluded by destination and Hotel C by incomplete stay availability. No reservation is created and no inventory is consumed.
- **Traces to:** FR2, A2.

### AC7 — Invalid stay dates

- **Given:** A destination and calendar-valid dates.
- **When:** Check-in is 2026-11-09 and check-out is 2026-11-07, or the dates are equal.
- **Then:** Each request is rejected with a date-validation error. It is not represented as a successful empty result, and inventory is unchanged.
- **Traces to:** FR2, FR4 stay-date rules.

### AC8 — No matching accommodation

- **Given:** No accommodation offer is available in Munich for the complete requested stay.
- **When:** A traveller searches Munich with valid dates.
- **Then:** The result is empty and indicates no matching accommodation. It is neither an input-validation error nor a server failure.
- **Traces to:** FR2.

### AC9 — Reservation status notification

- **Given:** Alice owns pending reservation B001; Bob does not own it.
- **When:** B001 changes from pending to confirmed.
- **Then:** Alice receives an in-app notification containing B001, previous status pending, and new status confirmed. Bob receives no notification about the change.
- **Traces to:** FR8, A4. Timing and duplicate-delivery criteria require refinement.

AC1 addresses one overbooking scenario rather than every concurrency defect. Additional fixtures are needed for multi-night accommodation and flight-seat contention. A sold-out business response is an expected rejection, not a server failure.

### Coverage and verification tracking

| Requirement | Current verification basis | Remaining coverage or evidence |
| --- | --- | --- |
| FR1 | Flight search contract proposal. | Explicit successful, invalid-input, and no-match acceptance scenarios. |
| FR2 | AC6–AC8; Hotel search contract. | Additional input-validation fixtures and executed behaviour/contract tests. |
| FR3 | AC2 for local rollback; Flight reservation contract. | Successful creation, rejected requests, and concurrent last-seat scenarios. |
| FR4 | AC1–AC2; AC7 date rules; Hotel reservation contract. | Successful creation, invalid payloads, unknown offers, and multi-night unavailability. |
| FR5 | AC3. | Recovery policy, hotel-first failure ordering, and completed-recovery verification. |
| FR6 | Two recommendation directions stated. | Agreed relevance criteria and acceptance scenarios for each direction. |
| FR7 | Reservation viewing and history stated. | Visible state/history definitions, ownership rules, and acceptance scenarios. |
| FR8 | AC9. | Delivery timing, duplicate handling, and executed ownership/delivery checks. |
| BR1–BR3 | AC1–AC3. | Multi-night and failure coverage; evidence from the relevant persistence implementation. |
| NFR1 | AC4. | Recorded participant results. |
| NFR2 | AC2–AC3. | Separate local-transaction and cross-service verification evidence. |
| NFR3 | Defined benchmark target and workload. | OD10 resolution and a reproducible benchmark report. |
| C1 | Planned backend substitution. | Agreed behavioural parity scope and contract tests. |

For each executed check, record the requirement/scenario ID, code revision, environment, expected result, actual result, outcome, and a report or CI-run link. A passing schema validator is evidence about the contract, not about inventory, transactions, or notifications.

## 8. Assumptions

| ID | Assumption | Impact |
| --- | --- | --- |
| A1 | Initial flight and accommodation inventory is synthetic and managed inside Bookinada. | Reproducible development; no live supplier integration assumed. |
| A2 | Flight search uses origin, destination, and departure date. Accommodation search uses destination, check-in, and check-out; it requests one room of the same room type throughout the half-open stay interval [check-in, check-out). Search does not reserve inventory or guarantee later booking success. | Defines the initial search scope; further matching, occupancy, and date-policy decisions remain OD2. |
| A3 | The future blockchain experiment uses a separate local/test network outside Bookinada. | The adapter is internal; the network is an external planned dependency. |
| A4 | Initial notifications are delivered in-app. | Email and SMS providers are not established dependencies. |
| A5 | NFR1's threshold and test conditions are proposed targets. | Require review and measurement; no observed usability result is implied. |
| A6 | NFR3's target and workload are a proposed local benchmark. | Require refinement and measurement; no production capacity or SLA is implied. |
| A7 | Development is currently individual and hosted on GitHub. | Repository collaboration and CI use GitHub; the workflow is not a product capability. |
| A8 | Initial reservation requests carry a synthetic test travellerId. | This is test identity, not authentication. Production ownership must derive from a verified identity (OD4). |
| A9 | A flight offer represents one scheduled departure with its own seat inventory, and each reservation requests one seat. | Recurring flight numbers, shared inventory across fares, connections, and round trips are outside the initial contract. |

## 9. Open decisions

Decisions are unresolved unless their outcome is recorded and the affected documents are updated. Owners and target dates still need assignment.

| ID | Decision | Affects | Resolution needed for |
| --- | --- | --- | --- |
| OD1 | Supported modification/cancellation actions and their rules. | FR7 and inventory lifecycle. | Implementing reservation changes beyond viewing. |
| OD2 | Destination matching, occupancy, multiple rooms, allowable search/booking dates, prices, and currencies. | FR1–FR4, A2, API contracts and fixtures. | Finalizing the affected domain and interface rules. |
| OD3 | Offer display fields, recommendation inputs, relevance/ranking criteria, and evaluation data. | FR6 and user-facing results. | Implementing and accepting recommendations. |
| OD4 | Identity, authentication, authorization, and reservation ownership. | FR3–FR4, FR7–FR8, A8. | Using real identities and accepting ownership-sensitive behaviour. |
| OD5 | Combined-booking states, compensation, recovery deadlines, and unrecoverable outcomes. | FR5, NFR2, AC3. | Accepting cross-service failure recovery. |
| OD6 | Persistent representation of flight seats, room types, and per-night accommodation inventory. | BR1–BR3, NFR2, AC1–AC2. | Verifying persistent reservations and concurrent inventory changes. |
| OD7 | Rule-based, local-model, or external-provider recommendation approach. | FR6, system context and architecture. | Selecting the recommendation implementation and dependencies. |
| OD8 | Retry, timeout, and idempotency behaviour for reservation creation. | FR3–FR5 and API contracts. | Defining outcomes when callers retry or lose a response. |
| OD9 | Testable concurrency criterion for independent inventory operations. | AC5 and later architecture evaluation. | Treating AC5 as a measurable acceptance gate. |
| OD10 | Benchmark request mix, timeouts, load-generation settings, and error acceptance criteria. | NFR3. | Accepting a repeatable performance benchmark. |

## 10. Review and change management

- Keep FR1–FR8, BR1–BR3, NFR1–NFR3, C1, AC1–AC9, and A1–A9 stable when refining their wording. New independent requirements or scenarios receive new IDs.
- Review changes against the system context, related API contracts, acceptance scenarios, and open decisions.
- Record scope changes and important assumption changes in the PR description, including the reason and affected IDs.
- Record reviewer agreement separately from implementation and verification status. No approval or test result is inferred from this document's existence.
- Resolve open decisions for the functionality being implemented; unrelated future decisions can remain open.
