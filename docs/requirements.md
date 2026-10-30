# Requirements — Week 1 proposal

Status: tutor-assisted Week 1 proposal, revised at the learner's request; learner approval and independent peer review remain pending. No application functionality has been implemented or tested. Source: Exercise Sheet 0, PDF pp. 13–15. Numerical targets and detailed acceptance rules below are proposed learning targets, not course-specified values.

## Users, goals, and stakeholders

- Primary user: a traveller planning a trip.
- User goal: find and reserve suitable flights and accommodation.
- Business stakeholder: Bookinada management, which requests an alternative blockchain booking implementation.
- Delivery stakeholder: the developer maintaining and testing the platform.

## Functional requirements

| ID  | Observable system behaviour                                                                                                                                                                                                                                                                                                                                        | Scenario trace                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| FR1 | Travellers can search for flights by origin, destination, and departure date.                                                                                                                                                                                                                                                                                      | Flight search; search fields are assumption A2.                                         |
| FR2 | Travellers can search for available accommodation by destination, check-in date, and check-out date. Results shall match the requested destination and offer an available room of the same room type for every night of the requested stay. If no offer matches, the system shall return an empty result and indicate that no matching accommodation is available. | Accommodation search; search fields and detailed rules are assumption A2; AC6–AC8.      |
| FR3 | Travellers can reserve an available flight independently of a hotel reservation.                                                                                                                                                                                                                                                                                   | Independent flight reservation.                                                         |
| FR4 | Travellers can reserve available hotel accommodation independently of a flight reservation.                                                                                                                                                                                                                                                                        | Independent accommodation reservation.                                                  |
| FR5 | Travellers can request a combined flight-and-hotel booking and view its outcome. The system shall report the combined booking as confirmed only when both reservations are confirmed; otherwise it shall show the actual pending or unsuccessful outcome without falsely claiming that the complete trip is booked.                                                | Combined booking and partial failures; BR2 and AC3.                                     |
| FR6 | The system recommends accommodation for a selected flight and flights for specified accommodation preferences.                                                                                                                                                                                                                                                     | Both recommendation directions from the scenario.                                       |
| FR7 | Travellers can view their reservations, current statuses, and recorded changes.                                                                                                                                                                                                                                                                                    | Reservation management and change tracking; editing and cancellation rules remain open. |
| FR8 | When a reservation's status changes, the system shall provide an in-app notification to the traveller who owns the reservation. The notification shall include the reservation ID, the previous status, and the new status.                                                                                                                                        | Notifications; A4 proposes in-app delivery.                                             |

FR6 has two separately testable acceptance cases, one for each recommendation direction; the relevance criteria still need refinement. FR7 is a deliberately limited first step; later requirements must clarify what other management operations are supported. The eight rows retain the course's high-level scope rather than silently adding authentication, payments, or an administration interface.

### Search rules proposed for FR2

- Destination, check-in date, and check-out date are required; the destination must not be blank and dates must be valid calendar dates.
- Check-out must be strictly after check-in. A stay includes check-in night and excludes the check-out date. For example, 2026-11-07 to 2026-11-09 requires availability on the nights of 7 and 8 November.
- Availability must hold for one room type throughout the stay. This first search scenario assumes one requested room; occupancy, multiple-room requests, destination matching, and price calculation need later refinement.
- Invalid search input produces a clear validation error rather than a normal empty result. Exact HTTP paths, status codes, and schemas belong to the next API-design exercise.
- Search does not reserve inventory. Availability must be checked again when a reservation is created; seeing an offer does not guarantee that a later booking succeeds.

These are explicit proposal A2, not additional instructions from the course.

## Non-functional requirements and quality concerns

### NFR1 — Usability

In a usability test, at least 90% of first-time users shall complete a hotel reservation independently within five minutes.

Why: travellers should be able to complete the booking flow without training.

Proposed test conditions: 10 first-time participants; start on the hotel search page; prepared test identity and available accommodation; finish when the reservation confirmation is displayed; no facilitator hints. At least 9 of 10 must succeed within five minutes. This is a small formative sample, not evidence about the whole population. Target and conditions are assumption A5; the test has not been run.

### NFR2 — Reliability and consistent booking outcomes

Inventory updates and reservation creation within one booking database shall succeed together or leave no partial changes. A combined booking shall not be reported as confirmed unless both its flight and accommodation reservations are confirmed.

Why: partial failures must not silently lose inventory or mislead travellers.

Verify using AC2 and AC3 below. Recovery behaviour across separate services requires later refinement; a single local database transaction does not automatically span independent databases.

### NFR3 — Search performance

For the local benchmark defined below, the 95th percentile of hotel-search API response times shall be at most two seconds.

Proposed benchmark: 100 seeded hotel offers, 10 concurrent virtual users, a warmed application, no network calls to external suppliers, 100 warm-up requests excluded followed by 1,000 measured requests; report hardware, response-time distribution, throughput, and error count. Do not exclude failed measured requests from the report. Target and load are assumption A6 and must be revisited after implementation.

Why: slow searches make the booking experience frustrating. This API target does not measure end-to-end usability.

## Business rules and invariants

- BR1: for each hotel, room type, and stay date, active reservations must not exceed the sellable capacity. Inventory must never become negative.
- BR2: a confirmed combined booking must have both a confirmed flight and confirmed accommodation reservation.
- BR3: a locally failed transaction must not consume inventory or create a committed reservation.

These are correctness constraints. A lock or transaction is an implementation mechanism, not the requirement itself. A multi-night stay must satisfy BR1 for every occupied night.

## Future architectural constraint

C1: explore smart-contract-based reservations as an alternative backend for flight and hotel booking, preserving traveller-facing booking behaviour. Exercise 0 does not require implementing it in Week 1. Interface details remain open.

## Acceptance scenarios to implement later

| ID                                          | Given                                                                                                                                                                                                                                 | When                                                                                                                 | Expected outcome                                                                                                                                                                                             |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC1 — Concurrent bookings                   | Exactly one sellable room for a fixed hotel, room type, and date; no cancellations or injected faults                                                                                                                                 | 10 requests, with distinct request IDs, attempt to reserve it concurrently                                           | Exactly one succeeds, nine receive a sold-out business response, remaining inventory is zero, and exactly one active reservation exists.                                                                     |
| AC2 — Local rollback                        | Inventory is one and no reservation exists                                                                                                                                                                                            | A failure is injected after the inventory update but before the reservation write, within the same local transaction | The transaction rolls back: inventory is one and no committed reservation exists.                                                                                                                            |
| AC3 — Partial combined booking              | A combined booking is requested                                                                                                                                                                                                       | The flight reservation succeeds but the hotel reservation fails                                                      | No false combined confirmation is displayed. A recoverable status is visible; a later recovery design releases or otherwise reconciles the partial reservation. Recovery deadline and policy are still open. |
| AC4 — Usability                             | The agreed first-time-user test conditions                                                                                                                                                                                            | Users attempt a hotel reservation                                                                                    | NFR1's proposed threshold is met and observed results are recorded.                                                                                                                                          |
| AC5 — Independent inventory                 | Two bookings address distinct inventory records                                                                                                                                                                                       | One booking holds its inventory lock                                                                                 | A later concurrency design should allow the other booking to proceed without waiting for an application-wide booking lock. Implementation-level verification remains to be designed.                         |
| AC6 — Hotel search                          | Only these three offers exist: Hotel A in Munich has one room of a single room type available on both 2026-11-07 and 2026-11-08; Hotel B in Berlin is available on both nights; Hotel C in Munich has no room available on 2026-11-08 | A traveller searches Munich, check-in 2026-11-07, check-out 2026-11-09                                               | Only Hotel A is returned. B is excluded by destination and C by incomplete stay availability. No reservation is created and no inventory is consumed.                                                        |
| AC7 — Invalid search dates                  | A destination and calendar-valid dates are supplied                                                                                                                                                                                   | A traveller searches with check-in 2026-11-09 and check-out 2026-11-07, or with equal check-in and check-out dates   | Each request is rejected with a clear date-validation error; neither is presented as a successful search with no matches. Inventory is unchanged.                                                            |
| AC8 — No matching accommodation             | No accommodation offer is available in Munich for the complete requested stay                                                                                                                                                         | A traveller searches Munich using valid dates                                                                        | The result is empty and the user is informed that no accommodation matches. This is an ordinary search outcome, not an input-validation error or a server failure.                                           |
| AC9 — Reservation status notification (FR8) | Alice owns reservation B001, which is pending; Bob does not own it.                                                                                                                                                                   | B001 changes from pending to confirmed.                                                                              | Alice receives an in-app notification containing reservation ID B001, previous status pending, and new status confirmed. Bob receives no notification about this change.                                     |

AC1 tests overbooking; it does not prove the absence of every concurrency defect. A sold-out response is an expected business result, not a server failure. AC6–AC8 refine FR2; these scenarios describe future checks and have not been executed against an application. AC5 is a later implementation-level concurrency scenario, not a Week 1 completion requirement.

## Explicit assumptions

| ID  | Assumption                                                                                                                                                                                                                                                                                                  | Reason and impact                                                                                                              |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| A1  | Early versions use synthetic flight and hotel inventory managed inside Bookinada.                                                                                                                                                                                                                           | Reproducible local development; no live supplier integration is assumed.                                                       |
| A2  | Search uses the fields in FR1/FR2. Initial hotel search requests one room; valid stays have check-out after check-in, cover nights in the half-open interval [check-in, check-out), and require one room type available throughout. Search neither reserves inventory nor guarantees later booking success. | Proposed refinement made at the learner's request; AC6–AC8 illustrate its observable behaviour. Validate against later sheets. |
| A3  | The future blockchain experiment uses a separate local/test network outside the Bookinada application boundary.                                                                                                                                                                                             | Makes the dependency explicit; no mainnet, cryptocurrency purchase, or wallet setup is required in Week 1.                     |
| A4  | Initial notifications are shown inside the application.                                                                                                                                                                                                                                                     | Email/SMS providers are not stated dependencies.                                                                               |
| A5  | The NFR1 target and test conditions are proposed by the learner/tutor.                                                                                                                                                                                                                                      | Not prescribed or yet validated by the course.                                                                                 |
| A6  | The NFR3 target and workload are proposed learning benchmarks.                                                                                                                                                                                                                                              | Not a production capacity claim or a measured result.                                                                          |
| A7  | The personal learning workflow is solo and uses GitHub.                                                                                                                                                                                                                                                     | Explicit deviation from the exercise's team/LRZ GitLab instructions.                                                           |
| A8 | Initial Hotel and Flight reservation requests carry a synthetic test travellerId. | Local learning only; not identity verification. Production ownership must come from a verified identity; authentication remains open. |
| A9 | A flight offer identifies one scheduled departure with its own seat inventory; each request reserves one seat. | Explicit initial API proposal. Recurring flight numbers, shared inventory across fares, connecting flights, and round trips are outside the first contract. |

## Open decisions

- What editing or cancellation operations does reservation management include?
- How are destinations matched, how are occupancy and multiple-room requests handled, and which dates may be searched? How are prices and currencies represented?
- Which offer fields are displayed, and which criteria make a recommendation relevant in each direction of FR6?
- What is the identity and authentication model?
- What compensation and recovery policy handles a partial combined booking?
- What inventory model will represent multi-night hotel stays and flight seats?
- Will recommendations use a local model, external provider, or initially a stub? No external AI provider is assumed in the context diagram.

## Review checklist

- [ ] Learner can explain every FR and NFR in their own words.
- [ ] Learner accepts or revises A1–A9 (assistant refinement does not imply learner approval).
- [x] Assistant inspected consistency between requirements, system-context documentation, and diagram labels; this is document review, not application testing.
- [ ] Another student has reviewed the requirements (not yet performed).
- [x] Assistant recorded known ambiguities and missing scenario behaviour in Open decisions.
