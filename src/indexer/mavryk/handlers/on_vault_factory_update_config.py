from mavryk.utils.error_reporting import save_error_report

from mavryk.types.vault_factory.storage import VaultFactoryStorage
from mavryk.types.vault_factory.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configVaultNameMaxLength
from dipdup.context import HandlerContext
from dipdup.models import Transaction
import mavryk.models as models

async def on_vault_factory_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, VaultFactoryStorage],
) -> None:

    try:
        # Get operation values
        vault_factory_address       = update_config.data.target_address
        updated_value               = int(update_config.parameter.updateConfigNewValue)
        update_config_action        = type(update_config.parameter.updateConfigAction)
        timestamp                   = update_config.data.timestamp
    
        # Update contract
        vault_factory = await models.VaultFactory.get(
            address = vault_factory_address
        )
        vault_factory.last_updated_at    = timestamp
        if update_config_action == configVaultNameMaxLength:
            vault_factory.vault_name_max_length = updated_value
        
        await vault_factory.save()

    except BaseException as e:
         await save_error_report(e)

