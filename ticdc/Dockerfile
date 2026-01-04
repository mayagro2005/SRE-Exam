FROM pingcap/ticdc:v7.5.1

COPY ticdc-entrypoint.sh /ticdc-entrypoint.sh
RUN chmod +x /ticdc-entrypoint.sh

ENTRYPOINT ["/ticdc-entrypoint.sh"]
