#!/bin/sh
set -e

# Start TiCDC server in background
/cdc server \
  --pd=http://pd0:2379 \
  --addr=0.0.0.0:8300 \
  --advertise-addr=ticdc:8300 &

echo "Waiting for TiCDC API to be ready..."
until curl -s http://ticdc:8300/api/v2/status > /dev/null; do
  echo "TiCDC not ready yet..."
  sleep 2
done
echo "TiCDC API is ready!"

echo "Waiting for appdb.users table to exist..."
until mysql -h tidb -P 4000 -u root -e "SELECT 1 FROM appdb.users LIMIT 1;" >/dev/null 2>&1; do
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
  }' || true

echo "Changefeed recreated successfully."

sleep infinity
