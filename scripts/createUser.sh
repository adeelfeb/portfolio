#!/usr/bin/env bash

set -euo pipefail

if ! command -v curl >/dev/null 2>&1; then
  echo "Error: curl is required to run this script." >&2
  exit 1
fi

API_URL="${API_URL:-http://localhost:8000/api/setup/internal-create-user}"

read -r -d '' PAYLOAD <<'JSON'
{
  "name": "Hr",
  "email": "h@h.com",
  "password": "temp123",
  "role": "hr"
}
JSON

echo "Creating HR user (Hr, h@h.com) via ${API_URL}..."
response="$(curl --fail --silent --show-error \
  -X POST "${API_URL}" \
  -H "Content-Type: application/json" \
  -d "${PAYLOAD}")"

echo "Server response:"
echo "${response}"

