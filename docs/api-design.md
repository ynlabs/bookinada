# Bookinada REST API Design

Status: proposed contracts; not yet implemented.

## Hotel Service

### Search accommodation offers

- Method: GET
- Path: /hotel-offers
- Purpose: find offers matching the destination with availability for every night of the requested stay.
- Side effects: no reservation is created and no inventory is consumed.

| Query parameter | Required | Format           | Example    |
| --------------- | -------- | ---------------- | ---------- |
| destination     | Yes      | Non-blank string | Munich     |
| checkIn         | Yes      | Date: YYYY-MM-DD | 2026-11-07 |
| checkOut        | Yes      | Date: YYYY-MM-DD | 2026-11-09 |

Check-out must be after check-in. The stay includes the check-in night
and excludes the check-out date. This initial design searches for one
room of the same room type throughout the stay.

Example request:

```http
GET /hotel-offers?destination=Munich&checkIn=2026-11-07&checkOut=2026-11-09
```

#### Responses

Response fields below are proposed design choices.

##### 200 OK — Search completed

The response contains an `offers` array. Every returned offer must
match the destination and provide the same room type for the full stay.

Example with one matching offer:

```json
{
  "offers": [
    {
      "offerId": "OFFER-A-DOUBLE",
      "hotelId": "HOTEL-A",
      "hotelName": "Hotel A",
      "destination": "Munich",
      "roomTypeId": "DOUBLE",
      "checkIn": "2026-11-07",
      "checkOut": "2026-11-09"
    }
  ]
}
```

A valid search with no matching offers returns 200 OK:

```json
{
  "offers": []
}
```

Search results do not guarantee later reservation success.
Availability must be checked again when creating a reservation.

##### 400 Bad Request — Invalid search input

Returned when a required parameter is missing, the destination is
blank, a date is invalid, or check-out is not after check-in.

Example for an invalid stay:

```json
{
  "error": {
    "code": "INVALID_SEARCH_REQUEST",
    "message": "checkOut must be after checkIn."
  }
}
```

### Retrieve accommodation offer details

- Method: GET
- Path: /hotel-offers/{offerId}
- Purpose: retrieve one offer and its availability for a requested stay.
- Side effects: no reservation is created and no inventory is consumed.

In this initial design, offerId identifies a hotel's room-type offer,
not a reservation or a guarantee of availability.

| Parameter | Location | Required | Format                     |
| --------- | -------- | -------- | -------------------------- |
| offerId   | Path     | Yes      | Non-blank offer identifier |
| checkIn   | Query    | Yes      | Date: YYYY-MM-DD           |
| checkOut  | Query    | Yes      | Date: YYYY-MM-DD           |

The same stay-date validation rules as hotel search apply.

Example request:

```http
GET /hotel-offers/OFFER-A-DOUBLE?checkIn=2026-11-07&checkOut=2026-11-09
```

#### Responses

- 200 OK: the offer exists; return its details and availability.
- 400 Bad Request: missing or invalid stay dates.
- 404 Not Found: the offerId does not identify an existing offer.

Example 200 response:

```json
{
  "offerId": "OFFER-A-DOUBLE",
  "hotelId": "HOTEL-A",
  "hotelName": "Hotel A",
  "destination": "Munich",
  "roomTypeId": "DOUBLE",
  "checkIn": "2026-11-07",
  "checkOut": "2026-11-09",
  "availableForStay": true
}
```

If the offer exists but is unavailable for the full stay, return
200 OK with availableForStay set to false.

Example 404 response:

```json
{
  "error": {
    "code": "OFFER_NOT_FOUND",
    "message": "The requested accommodation offer does not exist."
  }
}
```

### Create a hotel reservation

- Method: POST
- Path: /hotel-reservations
- Purpose: reserve one room of the offer's room type for the full stay.
- Content-Type: application/json

For local learning only, travellerId identifies a synthetic test traveller.
This is not an authentication mechanism. Production ownership must come
from a verified identity; authentication design remains an open decision.

Example request body:

```json
{
  "travellerId": "ALICE",
  "offerId": "OFFER-A-DOUBLE",
  "checkIn": "2026-11-07",
  "checkOut": "2026-11-09"
}
```

All four fields are required. Identifiers must be non-blank strings.
The same stay-date validation rules as hotel search apply.

The service must check availability again when processing the reservation.
A previous search or details response does not reserve inventory.

#### Responses

- 201 Created: the reservation is confirmed and inventory is consumed.
- 400 Bad Request: malformed JSON, missing fields, or invalid field values.
- 404 Not Found: the offerId does not identify an existing offer.
- 409 Conflict: the offer exists but capacity is unavailable for one or more nights.

Example 201 response:

```json
{
  "reservationId": "HR-001",
  "travellerId": "ALICE",
  "offerId": "OFFER-A-DOUBLE",
  "checkIn": "2026-11-07",
  "checkOut": "2026-11-09",
  "status": "confirmed"
}
```

Example 409 response:

```json
{
  "error": {
    "code": "ACCOMMODATION_UNAVAILABLE",
    "message": "The requested room type is unavailable for the full stay."
  }
}
```

Reservation creation and inventory updates must succeed together
within the Hotel Service's local database transaction.
If either fails, neither change may be committed.

Concurrent requests must not reserve more rooms than the capacity
available on any occupied night.

This POST operation does not yet provide an idempotency guarantee.
Retry handling requires later refinement.

## Flight Service

Status: tutor-assisted contract proposal; not yet implemented or tested.
The fields, identifiers, and rules below are learning design choices.
All example flights and travellers are synthetic.

In this initial design, a flight offer identifies one specific scheduled
flight occurrence, not a recurring flight number. Each reservation requests
one seat. A flight offer has its own seat inventory; shared inventory across
multiple fares, connecting flights, and round trips are outside this draft.

### Search flight offers

- Method: GET
- Path: /flight-offers
- Purpose: find available offers matching the origin, destination, and departure date.
- Side effects: no reservation is created and no inventory is consumed.

| Query parameter | Required | Format | Example |
| --- | --- | --- | --- |
| origin | Yes | Non-blank string | Munich |
| destination | Yes | Non-blank string | Berlin |
| departureDate | Yes | Date: YYYY-MM-DD | 2026-11-07 |

The initial synthetic catalogue uses city names rather than airport codes.
Leading and trailing whitespace is removed before exact, case-sensitive
matching. Origin and destination must differ after this normalization.
departureDate must be a valid calendar date and is interpreted as the
scheduled departure date at the origin, not an arrival date or a UTC date.
Restrictions on booking past departures remain to be defined before implementation.

Example request:

```http
GET /flight-offers?origin=Munich&destination=Berlin&departureDate=2026-11-07
```

#### Responses

- 200 OK: search completed; return matching offers with at least one available seat.
- 400 Bad Request: a required parameter is missing, blank, or invalid, or origin equals destination.

Example 200 response:

```json
{
  "offers": [
    {
      "offerId": "FLIGHT-OFFER-001",
      "flightId": "FLIGHT-001-20261107",
      "origin": "Munich",
      "destination": "Berlin",
      "departureDate": "2026-11-07"
    }
  ]
}
```

A valid search with no matching available offers returns 200 OK:

```json
{
  "offers": []
}
```

Example 400 response:

```json
{
  "error": {
    "code": "INVALID_SEARCH_REQUEST",
    "message": "departureDate must be a valid date in YYYY-MM-DD format."
  }
}
```

Search results do not reserve seats or guarantee later reservation success.

### Retrieve flight offer details

- Method: GET
- Path: /flight-offers/{offerId}
- Purpose: retrieve one scheduled flight offer and its current availability.
- Side effects: no reservation is created and no inventory is consumed.

| Parameter | Location | Required | Format |
| --- | --- | --- | --- |
| offerId | Path | Yes | Non-blank offer identifier |

Unlike hotel offer details, no stay dates are required: the flight offer
already identifies a specific scheduled departure.

Example request:

```http
GET /flight-offers/FLIGHT-OFFER-001
```

#### Responses

- 200 OK: the offer exists; return its details and current availability.
- 404 Not Found: the offerId does not identify an existing offer.

Example 200 response:

```json
{
  "offerId": "FLIGHT-OFFER-001",
  "flightId": "FLIGHT-001-20261107",
  "origin": "Munich",
  "destination": "Berlin",
  "departureDate": "2026-11-07",
  "availableForBooking": true
}
```

If the offer exists but no seats remain, return 200 OK with
availableForBooking set to false. An existing sold-out offer is not a 404.

Example 404 response:

```json
{
  "error": {
    "code": "OFFER_NOT_FOUND",
    "message": "The requested flight offer does not exist."
  }
}
```

### Create a flight reservation

- Method: POST
- Path: /flight-reservations
- Purpose: reserve one seat on the scheduled flight identified by the offer.
- Content-Type: application/json

For local learning only, travellerId identifies a synthetic test traveller,
using the same convention as hotel reservations. It is not authentication.
Production ownership must come from a verified identity; authentication
design remains an open decision.

Example request body:

```json
{
  "travellerId": "ALICE",
  "offerId": "FLIGHT-OFFER-001"
}
```

Both fields are required and must be non-blank strings. The departure date
is obtained from the offer rather than supplied again by the caller.
The service must check seat availability again when processing the request.

#### Responses

- 201 Created: the reservation is confirmed and one seat is consumed.
- 400 Bad Request: malformed JSON, missing fields, or invalid field values.
- 404 Not Found: the offerId does not identify an existing offer; use the OFFER_NOT_FOUND error above.
- 409 Conflict: the offer exists but no seat is available.

Example 201 response:

```json
{
  "reservationId": "FR-001",
  "travellerId": "ALICE",
  "offerId": "FLIGHT-OFFER-001",
  "flightId": "FLIGHT-001-20261107",
  "origin": "Munich",
  "destination": "Berlin",
  "departureDate": "2026-11-07",
  "status": "confirmed"
}
```

Example 400 response:

```json
{
  "error": {
    "code": "INVALID_RESERVATION_REQUEST",
    "message": "travellerId and offerId are required non-blank strings."
  }
}
```

Example 409 response:

```json
{
  "error": {
    "code": "FLIGHT_UNAVAILABLE",
    "message": "No seat is available for the requested flight offer."
  }
}
```

Reservation creation and seat-inventory updates must succeed together
within the Flight Service's local database transaction. If either fails,
neither change may be committed. Inventory must never become negative.
This transaction does not include Hotel Service or combined-booking state.

With exactly one remaining seat, two concurrent valid requests with no
other faults must produce one 201 response and one 409 response, one
confirmed reservation, and zero remaining seats.

This POST operation does not yet provide an idempotency guarantee.
Retry handling requires later refinement. A confirmed flight reservation
does not by itself mean that a combined flight-and-hotel booking succeeded.

### Shared conventions and remaining decisions

- Both services use an offers array for search, a single object for details,
  and an error object containing code and message for errors.
- Successful searches return 200 even when offers is empty; successful
  reservation creation returns 201; invalid input returns 400; unknown offers
  return 404; insufficient inventory during reservation creation returns 409.
- Pricing, traveller authentication, retry/idempotency rules, and operational
  server-error responses require refinement before production use.
- These examples are contract proposals, not evidence of executed API tests.
