FROM python:3.11.6-slim

RUN pip install poetry==1.8.4

WORKDIR /maven
COPY src/indexer/poetry.lock src/indexer/pyproject.toml /maven/
COPY src/indexer/dipdup.yml /maven/
COPY src/indexer/dipdup.contracts.yml /maven/
COPY src/indexer/dipdup.prod.yml /maven/

RUN poetry config virtualenvs.create false && poetry install --only main

ADD src/indexer/maven /maven/maven/

ENTRYPOINT ["poetry", "run", "dipdup", "-c", "dipdup.prod.yml", "-c", "dipdup.contracts.yml", "-c", "dipdup.yml", "run"]

EXPOSE 9090/tcp
