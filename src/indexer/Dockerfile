FROM python:3.11.6-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc  \ 
    libffi-dev \ 
    libc-dev \ 
    libssl-dev \
    rustc \
    cargo \
    && rm -rf /var/lib/apt/lists/*
RUN pip install poetry

WORKDIR /maven
COPY src/indexer/poetry.lock src/indexer/pyproject.toml /maven/
COPY src/indexer/dipdup.yml /maven/
COPY src/indexer/dipdup.contract.yml /maven/
COPY src/indexer/dipdup.prod.yml /maven/

RUN poetry config virtualenvs.create false && poetry install --no-dev

ADD src/indexer/maven /maven/maven/

ENTRYPOINT ["poetry", "run", "dipdup", "-c", "dipdup.prod.yml", "-c", "dipdup.contract.yml", "-c", "dipdup.yml"]

EXPOSE 9090/tcp
