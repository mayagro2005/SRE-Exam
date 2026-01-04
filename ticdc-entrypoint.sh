#!/bin/sh
set -e

# Start TiCDC server
/cdc server \
  --pd=http://pd0:2379 \
  --addr=0.0.0.0:8300 \
  --advertise-addr=ticdc:8300 &

echo "Waiting for PD to report TiKV stores..."
until curl -s http://pd0:2379/pd/api/v1/stores | grep '"count":1' > /dev/null; do
  sleep 2
done
echo "TiKV is ready!"

echo "Waiting for TiCDC API to be ready..."
until curl -s http://ticdc:8300/api/v2/status > /dev/null; do
  sleep 2
done
echo "TiCDC API is ready!"

echo "Creating changefeed..."
curl -X POST http://ticdc:8300/api/v2/changefeeds \
  -H "Content-Type: application/json" \
  -d '{"changefeed_id":"tidb-cdc","sink_uri":"kafka://kafka:9092/tidb-cdc?protocol=canal-json"}' || true

echo "Changefeed creation attempted."

wait
