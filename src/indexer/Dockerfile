FROM python:3.10.4-slim-buster

RUN pip install poetry

WORKDIR /mavryk
COPY poetry.lock pyproject.toml /mavryk/
COPY dipdup.yml /mavryk/

RUN poetry config virtualenvs.create false && poetry install --no-dev

ADD mavryk /mavryk/mavryk/

ENTRYPOINT ["poetry", "run", "dipdup"]

EXPOSE 9090/tcp
