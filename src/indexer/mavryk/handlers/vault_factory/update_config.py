from mavryk.utils.error_reporting import save_error_report

from mavryk.types.vault_factory.tezos_storage import VaultFactoryStorage
from mavryk.types.vault_factory.tezos_parameters.update_config import UpdateConfigParameter
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
import mavryk.models as models

async def update_config(
    ctx: HandlerContext,
    update_config: TzktTransaction[UpdateConfigParameter, VaultFactoryStorage],
) -> None:

    try:
        # Get operation values
        vault_factory_address       = update_config.data.target_address
        timestamp                   = update_config.data.timestamp
    
        # Update contract
        await models.VaultFactory.filter(
            network = ctx.datasource.network,
            address = vault_factory_address
        ).update(
            last_updated_at         = timestamp,
            vault_name_max_length   = update_config.storage.config.vaultNameMaxLength
        )

    except BaseException as e:
        await save_error_report(e)

