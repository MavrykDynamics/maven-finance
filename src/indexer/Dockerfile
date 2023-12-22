FROM python:3.11.6-slim

RUN pip install poetry

WORKDIR /maven
COPY poetry.lock pyproject.toml /maven/
COPY dipdup.yml /maven/
COPY dipdup.contract.yml /maven/
COPY dipdup.prod.yml /maven/

RUN poetry config virtualenvs.create false && poetry install --no-dev

ADD maven /maven/maven/

ENTRYPOINT ["poetry", "run", "dipdup", "-c", "dipdup.prod.yml", "-c", "dipdup.contract.yml", "-c", "dipdup.yml"]

EXPOSE 9090/tcp
