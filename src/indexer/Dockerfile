FROM python:3.10.4-slim-buster

RUN pip install poetry

WORKDIR /mavryk
COPY poetry.lock pyproject.toml /mavryk/
COPY dipdup.yml /mavryk/
COPY dipdup.contract.yml /mavryk/
COPY dipdup.wipe.yml /mavryk/
COPY dipdup.prod.yml /mavryk/

RUN poetry config virtualenvs.create false && poetry install --no-dev

ADD mavryk /mavryk/mavryk/

ENTRYPOINT ["poetry", "run", "dipdup", "-c", "dipdup.yml", "-c", "dipdup.contract.yml", "-c", "dipdup.prod.yml"]

EXPOSE 9090/tcp
