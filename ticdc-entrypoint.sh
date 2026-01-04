#!/bin/sh
set -e

# Start TiCDC server with correct PD address
/cdc server \
  --pd=http://pd0:2379 \
  --addr=0.0.0.0:8300 \
  --advertise-addr=ticdc:8300 &

# Wait for server to start
sleep 10

# Create changefeed via REST API (idempotent)
curl -X POST http://ticdc:8300/api/v2/changefeeds \
  -H "Content-Type: application/json" \
  -d '{
        "changefeed_id": "tidb-cdc",
        "sink_uri": "kafka://kafka:9092/tidb-cdc?protocol=canal-json"
      }' || true

wait
