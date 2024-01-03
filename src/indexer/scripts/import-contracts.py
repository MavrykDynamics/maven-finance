import yaml
import json
from os import path, listdir

# Constants
DEPLOYMENT_FILE="../contracts/test/contractDeployments.json"

# Helpers
def to_camel_case(snake_str):
    components = snake_str.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])

def update_dipdup_config(dipdup_config_filename):
    with open(dipdup_config_filename) as f:
        data        = yaml.load(f, Loader=yaml.FullLoader)

    contracts   = data['contracts']
    for contract in contracts:
        if path.exists(DEPLOYMENT_FILE):
            
            # Open file
            json_file       = open(DEPLOYMENT_FILE)
            json_data       = json.load(json_file)
            contract_camel  = to_camel_case(contract)

            if contract_camel in json_data:
                new_address = json_data[contract_camel]['address']

                # Save new address in dipdup config
                if 'code_hash' in data['contracts'][contract]:
                    data['contracts'][contract]['code_hash']  = new_address
                else:
                    data['contracts'][contract]['address']  = new_address

    with open(dipdup_config_filename, 'w') as f:
            yaml.dump(data, f, Dumper=NewLineDumper, default_flow_style=False, sort_keys=False)

class NewLineDumper(yaml.SafeDumper):
    # HACK: insert blank lines between top-level objects
    # inspired by https://stackoverflow.com/a/44284819/3786245
    def write_line_break(self, data=None):
        super().write_line_break(data)

        if len(self.indents) == 1:
            super().write_line_break()

# Update dipdup contract config files
update_dipdup_config("./dipdup.contract.yml")
