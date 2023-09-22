from mavryk.utils.error_reporting import save_error_report

from mavryk.types.treasury_factory.tezos_storage import TreasuryFactoryStorage
from mavryk.types.treasury_factory.tezos_parameters.update_config import UpdateConfigParameter
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
import mavryk.models as models

async def update_config(
    ctx: HandlerContext,
    update_config: TzktTransaction[UpdateConfigParameter, TreasuryFactoryStorage],
) -> None:

    try:
        # Get operation values
        treasury_factory_address    = update_config.data.target_address
        timestamp                   = update_config.data.timestamp
    
        # Update contract
        await models.TreasuryFactory.filter(
            network = ctx.datasource.network,
            address = treasury_factory_address
        ).update(
            last_updated_at             = timestamp,
            treasury_name_max_length    = update_config.storage.config.treasuryNameMaxLength
        )

    except BaseException as e:
        await save_error_report(e)

