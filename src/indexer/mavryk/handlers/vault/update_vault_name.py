from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.vault.parameter.update_vault_name import UpdateVaultNameParameter
from mavryk.types.vault.storage import VaultStorage
import mavryk.models as models

async def update_vault_name(
    ctx: HandlerContext,
    update_vault_name: Transaction[UpdateVaultNameParameter, VaultStorage],
) -> None:

    try:
        # Get operation info
        vault_address       = update_vault_name.data.target_address
        updated_name        = update_vault_name.parameter.__root__
    
        # Update record
        await models.Vault.filter(
            network = ctx.datasource.network,
            address = vault_address
        ).update(
            name          = updated_name
        )

    except BaseException as e:
        await save_error_report(e)

