FROM python:3.12.4-slim

RUN pip install poetry
RUN apt-get update && \
    apt-get -y install gcc && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /maven
COPY src/indexer/poetry.lock src/indexer/pyproject.toml /maven/
COPY src/indexer/dipdup.yml /maven/
COPY src/indexer/dipdup.contracts.yml /maven/
COPY src/indexer/dipdup.prod.yml /maven/

RUN poetry config virtualenvs.create false && poetry install --no-dev

ADD src/indexer/maven /maven/maven/

ENTRYPOINT ["poetry", "run", "dipdup", "-c", "dipdup.prod.yml", "-c", "dipdup.contracts.yml", "-c", "dipdup.yml", "run"]

EXPOSE 9090/tcp
