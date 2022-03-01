FROM python:3.9-slim-buster

RUN pip install poetry

WORKDIR /mavryk
COPY poetry.lock pyproject.toml /mavryk/

RUN poetry config virtualenvs.create false && poetry install --no-dev

COPY . /mavryk

ENTRYPOINT ["poetry", "run", "dipdup"]
CMD ["-c", "dipdup.yml", "run"]