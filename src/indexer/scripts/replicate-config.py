import yaml
import json
from os import path, listdir

# Constants
MAIN_CONFIG_FILE="local.dipdup.yml"

# Helpers
def replicate_dipdup_config(dipdup_config_filename):
    with open(MAIN_CONFIG_FILE) as f:
        local_data  = yaml.load(f, Loader=yaml.FullLoader)

    with open(dipdup_config_filename) as f:
        data        = yaml.load(f, Loader=yaml.FullLoader)

    if 'contracts' in local_data:
        data['contracts']   = local_data['contracts']
    
    if 'hooks' in local_data:
        data['hooks']   = local_data['hooks']
    
    if 'jobs' in local_data:
        data['jobs']   = local_data['jobs']
    
    if 'templates' in local_data:
        data['templates']   = local_data['templates']

    if 'indexes' in local_data:
        data['indexes']   = local_data['indexes']

    with open(dipdup_config_filename, 'w') as f:
            yaml.dump(data, f, Dumper=NewLineDumper, default_flow_style=False, sort_keys=False)

class NewLineDumper(yaml.SafeDumper):
    # HACK: insert blank lines between top-level objects
    # inspired by https://stackoverflow.com/a/44284819/3786245
    def write_line_break(self, data=None):
        super().write_line_break(data)

        if len(self.indents) == 1:
            super().write_line_break()

# Update all dipdup config files
for file in listdir("./"):
    if file.endswith("dipdup.yml") and file != MAIN_CONFIG_FILE:
        replicate_dipdup_config(file)
