# Get token contract standard
async def get_token_standard(ctx, contract_address):
    standard                = None
    
    # XTZ case 
    if contract_address == 'mv2ZZZZZZZZZZZZZZZZZZZZZZZZZZZDXMF2d':
        standard    = "tez"
    elif contract_address[0:3] == 'KT1' and len(contract_address) == 36:
        contract_summary        = None
        try:
            contract_summary    = await ctx.datasource.get_contract_summary(
                address = contract_address
            )
        except BaseException as e:
            ...
        if contract_summary:
            if 'tzips' in contract_summary:
                tzips   = contract_summary['tzips']
                if 'fa2' in tzips:
                    standard        = 'fa2'
                else:
                    if 'fa12' in tzips:
                        standard    = 'fa12'

    return standard

# Get contract metadata
async def get_contract_metadata(ctx, contract_address):
    network                     = ctx.datasource.name.replace('tzkt_','')
    metadata_datasource_name    = 'metadata_' + network.lower()
    metadata_datasource         = None
    contract_metadata           = None

    try:
        metadata_datasource         = ctx.get_metadata_datasource(metadata_datasource_name)
    except BaseException as e:
        ...

    if metadata_datasource:
        try:
            contract_metadata           = await metadata_datasource.get_contract_metadata(contract_address)
        except BaseException as e:
            ...

    return contract_metadata

# Get contract token metadata
async def get_contract_token_metadata(ctx, token_address, token_id='0'):
    network                     = ctx.datasource.name.replace('tzkt_','')
    metadata_datasource_name    = 'metadata_' + network.lower()
    token_metadata              = None

    try:
        metadata_datasource         = ctx.get_metadata_datasource(metadata_datasource_name)
        token_metadata              = await metadata_datasource.get_token_metadata(token_address, token_id)

        if not token_metadata:
            # TODO: Remove in prod
            # Check for mainnet as well
            metadata_datasource_name    = 'metadata_mainnet'
            metadata_datasource         = ctx.get_metadata_datasource(metadata_datasource_name)
            token_metadata              = await metadata_datasource.get_token_metadata(token_address, token_id)
    except BaseException as e:
        ...
        
    return token_metadata
