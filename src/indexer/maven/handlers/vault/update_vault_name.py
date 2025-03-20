from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.vault.tezos_parameters.update_vault_name import UpdateVaultNameParameter
from maven.types.vault.tezos_storage import VaultStorage
from maven import models as models

async def update_vault_name(
    ctx: HandlerContext,
    update_vault_name: TezosTransaction[UpdateVaultNameParameter, VaultStorage],
) -> None:

    try:
        # Get operation info
        vault_address       = update_vault_name.data.target_address
        updated_name        = update_vault_name.parameter.root
    
        # Update record
        vault, _            = await models.Vault.get_or_create(
            network = 'atlasnet',
            address = vault_address
        )
        vault.name  = updated_name
        await vault.save()

    except BaseException as e:
        await save_error_report(e)

