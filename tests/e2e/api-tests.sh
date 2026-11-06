#!/usr/bin/env bash
# End-to-end API tests against the live n8n webhook.
# Usage: SOLARFI_FORM_KEY=... tests/e2e/api-tests.sh   (or source .env.local first)
# Writes test leads with names starting "Etest" and mobiles +91 90000 000xx.
set -u
U=${WEBHOOK_URL:-https://ayrusai.app.n8n.cloud/webhook/solarfi-inquiry}
O=${ORIGIN:-https://solarfi.in}
K=${SOLARFI_FORM_KEY:?set SOLARFI_FORM_KEY}
TMP=$(mktemp)
post() { # $1 = label, $2 = body, rest = extra curl args
  local label=$1 body=$2; shift 2
  code=$(curl -s -o "$TMP" -w "%{http_code}" -X POST "$U" -H "Content-Type: application/json" -H "Origin: $O" -H "x-solarfi-key: $K" "$@" --data-binary "$body")
  printf '%-34s %s %s\n' "$label" "$code" "$(head -c 400 "$TMP")"
}
rid() { uuidgen | tr 'A-Z' 'a-z'; }
lead() { # name mobile property units rid [extra json]
  printf '{"name":"%s","mobile":"%s","email":"","city_area":"Kadapa","property_type":"%s","monthly_units_kwh":%s,"monthly_bill_inr":"","roof_area_sqft":"","message":"","consent":true,"honeypot":"","client_request_id":"%s"%s}' "$1" "$2" "$3" "$4" "$5" "${6:-}"
}

echo "== T2 validation (expect 422, nothing written)"
post "T2 units 19"          "$(lead 'Etest Units Low' 9000000010 home 19 "$(rid)")"
post "T2 units 10001"       "$(lead 'Etest Units High' 9000000010 home 10001 "$(rid)")"
post "T2 mobile 5xxxxxxxxx" "$(lead 'Etest Bad Mobile' 5000000010 home 300 "$(rid)")"
post "T2 non-Indian mobile" "$(lead 'Etest US Mobile' '+1 5073581319' home 300 "$(rid)")"
post "T2 name with digits"  "$(lead 'Etest R2D2' 9000000010 home 300 "$(rid)")"
post "T2 name 81 chars"     "$(lead "Etest $(printf 'a%.0s' $(seq 77))" 9000000010 home 300 "$(rid)")"
post "T2 message 1001"      "$(lead 'Etest Long Msg' 9000000010 home 300 "$(rid)" ",\"message\":\"$(printf 'm%.0s' $(seq 1001))\"")"
post "T2 bad property"      "$(lead 'Etest Farm' 9000000010 farm 300 "$(rid)")"
post "T2 no consent"        "$(lead 'Etest No Consent' 9000000010 home 300 "$(rid)" ',"consent":false')"
post "T2 bad email"         "$(lead 'Etest Bad Email' 9000000010 home 300 "$(rid)" ',"email":"nope"')"
post "T2 roof 49"           "$(lead 'Etest Roof' 9000000010 home 300 "$(rid)" ',"roof_area_sqft":49')"
post "T2 missing request id" "$(lead 'Etest No Rid' 9000000010 home 300 'x')"
echo "== Malformed JSON (expect 400)"
post "malformed JSON"       '{"name": "Etest Broken",'

echo "== T3 routing"
post "T3 commercial"        "$(lead 'Etest Commercial' 9000000011 commercial 1200 "$(rid)")"
post "T3 home"              "$(lead 'Etest Home' 9000000012 home 300 "$(rid)")"
post "T3 government"        "$(lead 'Etest Government' 9000000013 government 5000 "$(rid)")"
post "T3 shop"              "$(lead 'Etest Shop' 9000000014 shop 450 "$(rid)")"

echo "== T4 honeypot (expect 200, nothing written)"
post "T4 honeypot filled"   "$(lead 'Etest Honeypot' 9000000015 home 300 "$(rid)" ',"honeypot":"http://spam.example"')"

echo "== T7 duplicate mobile (second flagged)"
post "T7 first"             "$(lead 'Etest Dup One' 9000000016 home 300 "$(rid)")"
post "T7 second same mobile" "$(lead 'Etest Dup Two' '+91-90000-00016' home 310 "$(rid)")"

echo "== T8 same client_request_id twice (one row)"
R=$(rid)
post "T8 first"             "$(lead 'Etest Idem' 9000000017 home 300 "$R")"
post "T8 retry same id"     "$(lead 'Etest Idem' 9000000017 home 300 "$R")"
echo "T8 client_request_id=$R"
rm -f "$TMP"
