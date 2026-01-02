#!/bin/sh
set -e

# Start TiCDC server in background
/cdc/cdc server &

# Wait for server to be ready
sleep 10

# Create the changefeed
/cdc changefeed create \
    --pd=http://tidb:2379 \
    --sink-uri="kafka://kafka:9092/tidb-cdc"

# Keep the container alive
wait
