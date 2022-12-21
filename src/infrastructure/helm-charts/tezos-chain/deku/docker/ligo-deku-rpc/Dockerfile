FROM ligolang/ligo:0.57.0

# Copy api source
WORKDIR /app
COPY nix /nix/
COPY --from=ligolang/ligo:0.57.0 /root/ligo /bin/ligo

# Start api
CMD /nix/store/pm3xyqyp4ml15vidrm8b4nl2cm1ghf1i-ocaml5.0.0+alpha1-deku-0.0.0-dev/bin/ligo-deku-rpc
ENTRYPOINT []

# Expose api port
EXPOSE 9090
