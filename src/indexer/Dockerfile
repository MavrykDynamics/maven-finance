FROM python:3.12.4-slim

RUN pip install poetry==1.8.4

WORKDIR /indexer
COPY src/indexer/poetry.lock src/indexer/pyproject.toml /indexer/
COPY src/indexer/dipdup.yml /indexer/
COPY src/indexer/dipdup.contracts.yml /indexer/
COPY src/indexer/dipdup.prod.yml /indexer/

RUN poetry config virtualenvs.create false && poetry install --only main

ADD src/indexer/maven /indexer/maven/

ENTRYPOINT ["poetry", "run", "dipdup", "-c", "dipdup.prod.yml", "-c", "dipdup.contracts.yml", "-c", "dipdup.yml", "schema", "wipe", "--force"]

EXPOSE 9090/tcp
