from mavryk.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext
from mavryk.types.doorman.tezos_storage import DoormanStorage
from mavryk.types.doorman.tezos_parameters.update_config import UpdateConfigParameter
import mavryk.models as models

async def update_config(
    ctx: HandlerContext,
    update_config: TzktTransaction[UpdateConfigParameter, DoormanStorage],
) -> None:

    try:    
        # Get operation values
        doorman_address         = update_config.data.target_address
        timestamp               = update_config.data.timestamp
    
        # Update contract
        await models.Doorman.filter(
            network = ctx.datasource.network,
            address = doorman_address
        ).update(
            last_updated_at = timestamp,
            min_mvk_amount  = update_config.storage.config.minMvkAmount
        )

    except BaseException as e:
        await save_error_report(e)

