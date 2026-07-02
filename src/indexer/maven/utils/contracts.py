from maven.utils.constants import NETWORK


# Get token contract standard
async def get_token_standard(ctx, contract_address):
    standard                = None
    
    # MVRK case 
    if contract_address == 'mv2ZZZZZZZZZZZZZZZZZZZZZZZZZZZDXMF2d':
        standard    = "mav"
    elif contract_address[0:3] == 'KT1' and len(contract_address) == 36:
        contract_summary        = None
        try:
            datasource          = ctx.get_tezos_tzkt_datasource('mvkt_' + NETWORK.lower())
            contract_summary    = await datasource.get_contract_summary(
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
    network                     = NETWORK
    metadata_datasource_name    = 'metadata_' + network.lower()
    metadata_datasource         = None
    contract_metadata           = None

    try:
        metadata_datasource         = ctx.get_tzip_metadata_datasource(metadata_datasource_name)
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
    network                     = NETWORK
    metadata_datasource_name    = 'metadata_' + network.lower()
    token_metadata              = None

    try:
        metadata_datasource         = ctx.get_tzip_metadata_datasource(metadata_datasource_name)
        token_metadata              = await metadata_datasource.get_token_metadata(token_address, token_id)

        if not token_metadata:
            # TODO: Remove in prod
            # Check for mainnet as well
            metadata_datasource_name    = 'metadata_mainnet'
            metadata_datasource         = ctx.get_tzip_metadata_datasource(metadata_datasource_name)
            token_metadata              = await metadata_datasource.get_token_metadata(token_address, token_id)
    except BaseException as e:
        ...

    return token_metadata

# Refresh the token-level metadata (TZIP-12) of a single Token row.
async def refresh_token_metadata(ctx, token):
    updated                     = False

    new_metadata                = await get_contract_token_metadata(
        ctx             = ctx,
        token_address   = token.token_address,
        token_id        = str(token.token_id),
    )
    if new_metadata and new_metadata != token.metadata:
        token.metadata          = new_metadata
        updated                 = True

    # Standard never changes, so only backfill it when missing.
    if not token.token_standard:
        standard                = await get_token_standard(ctx, token.token_address)
        if standard:
            token.token_standard = standard
            updated             = True

    if updated:
        await token.save()

    return updated

# Refresh the contract-level metadata (TZIP-16) of a single MavenContract row
# (MToken, Farm, ...). Same non-clobbering semantics as refresh_token_metadata.
async def refresh_maven_contract_metadata(ctx, contract):
    new_metadata                = await get_contract_metadata(
        ctx                 = ctx,
        contract_address    = contract.address,
    )
    if new_metadata and new_metadata != contract.metadata:
        contract.metadata       = new_metadata
        await contract.save()
        return True

    return False
