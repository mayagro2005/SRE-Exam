#!/bin/sh

set -e

echo "Waiting for PD to be ready..."
until curl -s http://pd0:2379/pd/api/v1/version > /dev/null; do
  echo "PD not ready yet..."
  sleep 2
done
echo "PD is ready!"

echo "Starting TiCDC server..."
/cdc server --pd="http://pd0:2379" --addr="0.0.0.0:8300" --advertise-addr="ticdc:8300" &
CDC_PID=$!

echo "Waiting for TiCDC API to be ready..."
until curl -s http://ticdc:8300/api/v2/status > /dev/null; do
  echo "TiCDC not ready yet..."
  sleep 2
done
echo "TiCDC API is ready!"

echo "Waiting for appdb.users table to exist..."
until curl -s http://tidb:10080/schema/appdb | grep -q '"users"'; do
  echo "Table not ready yet..."
  sleep 2
done
echo "Table is ready!"

echo "Deleting old changefeed if exists..."
curl -X DELETE http://ticdc:8300/api/v2/changefeeds/tidb-cdc || true

echo "Creating fresh changefeed..."
curl -X POST http://ticdc:8300/api/v2/changefeeds \
  -H "Content-Type: application/json" \
  -d '{
        "changefeed_id": "tidb-cdc",
        "sink_uri": "kafka://kafka:9092/tidb-cdc?protocol=canal-json",
        "filter": {
          "rules": ["appdb.*"]
        }
      }'

echo "Changefeed recreated successfully."

wait $CDC_PID
