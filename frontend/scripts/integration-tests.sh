#!/usr/bin/env bash
# Simple integration test script for PDF server
set -euo pipefail

BASE_URL=${PDF_SERVER_URL:-http://localhost:3001}
KEY_HEADER=""
if [ -n "${PDF_API_KEY:-}" ]; then
  KEY_HEADER="-H 'Authorization: Bearer ${PDF_API_KEY}'"
fi

echo "1) Attachment (default)"
curl -v -X POST ${BASE_URL}/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"title":"اختبار","headers":["اسم","موقع","ملاحظات"],"rows":[["A","B","C"]],"filename":"test-attachment","response":"attachment"}' \
  --output test-attachment.pdf || { echo 'failed'; exit 1; }
echo "-> saved test-attachment.pdf"

echo "2) Inline display (should open in browser when requested)"
curl -v -X POST ${BASE_URL}/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"title":"عرض","headers":["اسم"],"rows":[["حدود طويلة جدا لتجربة الالتفاف في اللغة العربية والتي تحتاج أن تكسر الأسطر بشكل صحيح"]],"filename":"test-inline","response":"inline"}' \
  --output test-inline.pdf || { echo 'failed'; exit 1; }
echo "-> saved test-inline.pdf"

echo "3) Base64 response"
curl -s -X POST ${BASE_URL}/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"title":"base64","headers":["H1"],"rows":[["v1"]],"filename":"test-base64","response":"base64"}' | jq -r .content_base64 | base64 --decode > test-base64.pdf
echo "-> saved test-base64.pdf"

echo "4) Cache behaviour: run same request twice and check quick return"
START=$(date +%s%3N)
curl -s -X POST ${BASE_URL}/generate-pdf -H "Content-Type: application/json" -d '{"title":"cache","headers":["H1"],"rows":[["v1"]],"filename":"test-cache","response":"attachment"}' -o /dev/null
FIRST=$(date +%s%3N)
curl -s -X POST ${BASE_URL}/generate-pdf -H "Content-Type: application/json" -d '{"title":"cache","headers":["H1"],"rows":[["v1"]],"filename":"test-cache","response":"attachment"}' -o /dev/null
SECOND=$(date +%s%3N)
echo "First ms: $((FIRST-START)), Second ms: $((SECOND-FIRST)) (second should be faster if cached)"

echo "Integration tests completed."
