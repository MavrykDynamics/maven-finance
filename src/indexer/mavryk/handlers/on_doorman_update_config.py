from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.doorman.storage import DoormanStorage
from mavryk.types.doorman.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configMinMvkAmount
import mavryk.models as models

async def on_doorman_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, DoormanStorage],
) -> None:

    try:    
        # Get operation values
        doorman_address         = update_config.data.target_address
        updated_value           = int(update_config.parameter.updateConfigNewValue)
        update_config_action    = type(update_config.parameter.updateConfigAction)
        timestamp               = update_config.data.timestamp
    
        # Update contract
        doorman                 = await models.Doorman.get(
            address = doorman_address
        )
        doorman.last_updated_at = timestamp
        if update_config_action == configMinMvkAmount:
            doorman.min_mvk_amount  = updated_value
        
        await doorman.save()

    except BaseException:
         await save_error_report()

