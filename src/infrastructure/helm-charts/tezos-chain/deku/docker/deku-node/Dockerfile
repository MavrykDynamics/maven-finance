# We'll use the official nodejs
# image as our base, but you should be able
# to use any image.
FROM node

# Copy the deku-node and it's required system libraries
# into your image.
COPY nix /nix/

WORKDIR /app

# Start node
CMD /nix/store/hkbvm7iig39h2qj01s4ll102kcqd3scw-ocaml5.0.0+alpha1-deku-0.0.0-dev/bin/deku-node

# Expose node port
EXPOSE 4440
