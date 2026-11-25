from pathlib import Path

from openapi_spec_validator import validate
from openapi_spec_validator.readers import read_from_filename

PROJECT_ROOT = Path(__file__).resolve().parents[1]
API_DIR = PROJECT_ROOT / "api"


def main() -> int:
    api_files = sorted(API_DIR.glob("*.openapi.yaml"))

    if not api_files:
        print("No OpenAPI files found.")
        return 1

    failed = False

    for api_file in api_files:
        relative_path = api_file.relative_to(PROJECT_ROOT)

        try:
            spec, base_uri = read_from_filename(str(api_file))
            validate(spec, base_uri=base_uri)

            print(f"{relative_path}: PASSED")

        except Exception as error:
            print(f"{relative_path}: FAILED")
            print(error)
            failed = True

    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
