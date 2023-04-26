from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.vault.parameter.update_vault_name import UpdateVaultNameParameter
from mavryk.types.vault.storage import VaultStorage
import mavryk.models as models

async def on_vault_update_vault_name(
    ctx: HandlerContext,
    update_vault_name: Transaction[UpdateVaultNameParameter, VaultStorage],
) -> None:

    try:
        # Get operation info
        vault_address       = update_vault_name.data.target_address
        updated_name        = update_vault_name.parameter.__root__
    
        # Update record
        vault               = await models.Vault.get(
            address = vault_address
        )
        vault.name          = updated_name
    
        await vault.save()

    except BaseException:
         await save_error_report()

