from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.doorman.storage import DoormanStorage
from mavryk.types.doorman.parameter.update_config import UpdateConfigParameter
import mavryk.models as models

async def update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, DoormanStorage],
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

