from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.vault.tezos_parameters.set_baker import SetBakerParameter
from maven.types.vault.tezos_storage import VaultStorage
from maven import models as models

async def set_baker(
    ctx: HandlerContext,
    set_baker: TezosTransaction[SetBakerParameter, VaultStorage],
) -> None:

    try:
        # Get operation info
        vault_address       = set_baker.data.target_address
        baker_address       = set_baker.parameter.root
    
        # Update record
        baker               = None
        if baker_address:
            baker   = await models.get_user(network='atlasnet', address=baker_address)       
        vault, _            = await models.Vault.get_or_create(
            network = 'atlasnet',
            address = vault_address
        )
        vault.baker  = baker
        await vault.save()

    except BaseException as e:
        await save_error_report(e)

