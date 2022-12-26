FROM python:3.9-bullseye

WORKDIR /app

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY ./exporter.py /app/

CMD [ "python", "/app/exporter.py" ]

EXPOSE 9090
