#!/bin/sh
set -e

# Start TiCDC server in background
/cdc server &

# Wait for server to start
sleep 10

# Create the changefeed (correct CLI for nightly)
# Only create if it doesn't exist
if ! /cdc changefeed list | grep -q tidb-cdc; then
    /cdc changefeed create \
        --pd=http://tidb:2379 \
        --sink-uri="kafka://kafka:9092/tidb-cdc"
fi

# Keep container running
wait
