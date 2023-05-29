from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.break_glass.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configActionExpiryDays, UpdateConfigActionItem1 as configCouncilImageMaxLength, UpdateConfigActionItem2 as configCouncilNameMaxLength, UpdateConfigActionItem3 as configCouncilWebsiteMaxLength, UpdateConfigActionItem4 as configThreshold
from mavryk.types.break_glass.storage import BreakGlassStorage
import mavryk.models as models

async def on_break_glass_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, BreakGlassStorage],
) -> None:

    try:
        # Get operation values
        break_glass_address     = update_config.data.target_address
        updated_value           = int(update_config.parameter.updateConfigNewValue)
        update_config_action    = type(update_config.parameter.updateConfigAction)
        timestamp               = update_config.data.timestamp
    
        # Update contract
        breakGlass = await models.BreakGlass.get(
            network = ctx.datasource.network,
            address = break_glass_address
        )
        breakGlass.last_updated_at  = timestamp
        if update_config_action == configActionExpiryDays:
            breakGlass.action_expiry_days                   = updated_value
        elif update_config_action == configCouncilImageMaxLength:
            breakGlass.council_member_image_max_length      = updated_value
        elif update_config_action == configCouncilNameMaxLength:
            breakGlass.council_member_name_max_length       = updated_value
        elif update_config_action == configCouncilWebsiteMaxLength:
            breakGlass.council_member_website_max_length    = updated_value
        elif update_config_action == configThreshold:
            breakGlass.threshold                            = updated_value
    
        await breakGlass.save()

    except BaseException as e:
         await save_error_report(e)

