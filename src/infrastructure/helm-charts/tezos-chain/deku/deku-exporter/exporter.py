import os
import time
from prometheus_client import start_http_server, Gauge, Histogram, Info
from pytezos import pytezos
import requests

class AppMetrics:
    """
    Representation of Prometheus metrics and loop to fetch and transform
    application metrics into Prometheus metrics.
    """

    def __init__(self, app_port=80, polling_interval_seconds=5):
        self.app_port = app_port
        self.polling_interval_seconds = polling_interval_seconds

        # Prometheus metrics to collect
        self.deku_info = Info("deku", "Deku info")
        self.deku_tps = Gauge("deku_transactions_per_second", "Deku transactions per second", ['consensus_address'])
        self.deku_latency = Gauge("deku_latency", "Deku latency", ['consensus_address'])
        self.deku_chain_head_level = Gauge("deku_chain_head_level", "Deku chain head level", ['consensus_address'])
        self.deku_contracts_originated = Gauge("deku_contracts_originated", "Deku contracts originated", ['consensus_address'])
        self.deku_validators = Gauge("deku_validators", "Deku validators", ['consensus_address', 'validator'])

    def run_metrics_loop(self):
        """Metrics fetching loop"""

        while True:
            self.fetch()
            time.sleep(self.polling_interval_seconds)

    def fetch(self):
        """
        Get metrics from application and refresh Prometheus metrics with
        new values.
        """

        # Fetch raw status data from the application
        # resp = requests.get(url=f"http://localhost:{self.app_port}/api/v1/chain/info")
        resp = requests.get(url=f"http://localhost:{self.app_port}/api/v1/chain/info")
        data = resp.json()
        consensus_address = data['consensus']
        self.deku_info.info({'in_sync': str(data['in_sync']), 'consensus_address': consensus_address})

        resp = requests.get(url=f"http://localhost:{self.app_port}/api/v1/chain/stats")
        data = resp.json()
        self.deku_tps.labels(consensus_address=consensus_address).set(float(data['tps']))
        self.deku_latency.labels(consensus_address=consensus_address).set(float(data['latency']))

        resp = requests.get(url=f"http://localhost:{self.app_port}/api/v1/chain/level")
        data = resp.json()
        self.deku_chain_head_level.labels(consensus_address=consensus_address).set(float(data['level']))

        resp = requests.get(url=f"http://localhost:{self.app_port}/api/v1/state/unix")
        data = resp.json()
        self.deku_contracts_originated.labels(consensus_address=consensus_address).set(len(data))

        consensus_contract_storage = pytezos.using("https://basenet-baking-archive-node.mavryk.network").contract(consensus_address).storage()
        validators = consensus_contract_storage['root_hash']['current_validators']
        for validator in validators:
            self.deku_validators.labels(consensus_address=consensus_address, validator=validator).set(0)

def main():
    """Main entry point"""

    polling_interval_seconds = int(os.getenv("POLLING_INTERVAL_SECONDS", "5"))
    app_port = int(os.getenv("APP_PORT", "80"))
    exporter_port = int(os.getenv("EXPORTER_PORT", "9090"))

    app_metrics = AppMetrics(
        app_port=app_port,
        polling_interval_seconds=polling_interval_seconds
    )
    start_http_server(exporter_port)
    app_metrics.run_metrics_loop()

if __name__ == "__main__":
    main()