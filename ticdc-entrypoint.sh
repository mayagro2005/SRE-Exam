#!/bin/sh
set -e

# Start TiCDC server in background
/cdc server \
  --pd=http://pd0:2379 \
  --addr=0.0.0.0:8300 \
  --advertise-addr=ticdc:8300 &

echo "Waiting for TiCDC API to be ready..."
until curl -s http://ticdc:8300/api/v2/status > /dev/null; do
  sleep 2
done
echo "TiCDC API is ready!"

echo "Waiting extra 3 seconds for TiCDC to stabilize..."
sleep 3

echo "Creating changefeed..."
curl -X POST http://ticdc:8300/api/v2/changefeeds \
  -H "Content-Type: application/json" \
  -d '{
    "changefeed_id": "tidb-cdc",
    "sink_uri": "kafka://kafka:9092/tidb-cdc?protocol=canal-json",
    "filter": {
      "rules": ["appdb.*"]
    }
  }' || true

echo "Changefeed creation attempted."

# Keep container alive so CDC keeps running
sleep infinity
