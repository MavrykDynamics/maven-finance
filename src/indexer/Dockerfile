FROM python:3.11.6-slim

ARG INDEXER_PATH=src/indexer

RUN pip install poetry

WORKDIR /mavryk
COPY ${INDEXER_PATH}/poetry.lock ${INDEXER_PATH}/pyproject.toml /mavryk/
COPY ${INDEXER_PATH}/dipdup.yml /mavryk/
COPY ${INDEXER_PATH}/dipdup.contract.yml /mavryk/
COPY ${INDEXER_PATH}/dipdup.prod.yml /mavryk/

RUN poetry config virtualenvs.create false && poetry install --no-dev

ADD ${INDEXER_PATH}/mavryk /mavryk/mavryk/

ENTRYPOINT ["poetry", "run", "dipdup", "-c", "dipdup.prod.yml", "-c", "dipdup.contract.yml", "-c", "dipdup.yml"]

EXPOSE 9090/tcp
