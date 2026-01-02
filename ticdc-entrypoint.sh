#!/bin/sh
set -e

# Start TiCDC server in the background
/cdc server &

# Wait a bit for server to start
sleep 10

# Create the changefeed (correct CLI syntax)
/cdc changefeed create \
    --pd=http://tidb:2379 \
    --sink-uri="kafka://kafka:9092/tidb-cdc"

# Keep the container alive
wait
