import yaml
import json
from os import path, listdir

# Constants
DEPLOYMENT_FOLDER="../contracts/deployments/"
SUFFIX="Address.json"

# Helpers
def to_camel_case(snake_str):
    components = snake_str.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])

def update_dipdup_config(dipdup_config_filename):
    with open(dipdup_config_filename) as f:
        data        = yaml.load(f, Loader=yaml.FullLoader)

    contracts   = data['contracts']
    for contract in contracts:
        filename    = DEPLOYMENT_FOLDER + to_camel_case(contract) + SUFFIX
        if path.exists(filename):
            
            # Open file
            json_file   = open(filename)
            json_data   = json.load(json_file)
            new_address = json_data['address']

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
