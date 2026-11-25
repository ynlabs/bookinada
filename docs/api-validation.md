# API Validation

## 1. Context

Exercise Sheet 1, project exercises 8 and 9, requires Flight and Hotel REST interfaces, separate OpenAPI 3.0.3 contracts, and automated Redocly validation.

This personal learning project migrates its API validation tooling to Python to maintain a consistent backend development ecosystem. The Python-based validation does not necessarily cover all Redocly linting rules or replace course-specific requirements.

## 2. Validation Components

| File                                   | Responsibility                      |
| -------------------------------------- | ----------------------------------- |
| `api/hotel.openapi.yaml`               | Hotel API contract                  |
| `api/flight.openapi.yaml`              | Flight API contract                 |
| `requirements-dev.txt`                 | Python development dependencies     |
| `scripts/validate_api.py`              | Automated OpenAPI validation script |
| `.github/workflows/api-validation.yml` | GitHub Actions validation workflow  |

## 3. Local Setup

From the repository root:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
```

## 4. Run Validation

```bash
python scripts/validate_api.py
```

Alternatively, use the validator directly:

```bash
python -m openapi_spec_validator api/*.openapi.yaml
```

## 5. Validation Behavior

The validation script discovers OpenAPI YAML files in the API directory and validates each specification using `openapi-spec-validator`.

- Exit code 0: all discovered specifications pass validation.
- Exit code 1: at least one specification fails validation, or no specifications are found.

## 6. Continuous Integration

GitHub Actions is configured to automate API validation using a Python environment.

The intended workflow:

1. Check out the repository.
2. Set up Python.
3. Install development dependencies.
4. Execute the API validation script.
5. Report the validation result.

## 7. Current Validation Results

| Check                                     | Status  |
| ----------------------------------------- | ------- |
| Python validator installation             | Passed  |
| Flight OpenAPI validation                 | Passed  |
| Hotel OpenAPI validation                  | Passed  |
| Custom Python validation script           | Passed  |
| Unresolved reference fault-injection test | Pending |
| Remote GitHub Actions execution           | Pending |

## 8. Limitations

OpenAPI specification validation does not verify the runtime behavior of the REST services.

The Python validator does not automatically reproduce all Redocly-specific linting rules, including warnings for unused schemas.

Additional API implementation, automated testing, and integration testing are required.
