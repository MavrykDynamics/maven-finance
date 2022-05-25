
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.break_glass.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configActionExpiryDays, UpdateConfigActionItem1 as configCouncilImageMaxLength, UpdateConfigActionItem2 as configCouncilNameMaxLength, UpdateConfigActionItem3 as configCouncilWebsiteMaxLength, UpdateConfigActionItem4 as configThreshold
from mavryk.types.break_glass.storage import BreakGlassStorage
import mavryk.models as models

async def on_break_glass_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, BreakGlassStorage],
) -> None:

    # Get operation values
    breakGlassAddress       = update_config.data.target_address
    updatedValue            = int(update_config.parameter.updateConfigNewValue)
    updateConfigAction      = type(update_config.parameter.updateConfigAction)

    # Update contract
    breakGlass = await models.BreakGlass.get(
        address = breakGlassAddress
    )
    if updateConfigAction == configActionExpiryDays:
        breakGlass.action_expiry_days                   = updatedValue
    elif updateConfigAction == configCouncilImageMaxLength:
        breakGlass.council_member_image_max_length      = updatedValue
    elif updateConfigAction == configCouncilNameMaxLength:
        breakGlass.council_member_name_max_length       = updatedValue
    elif updateConfigAction == configCouncilWebsiteMaxLength:
        breakGlass.council_member_website_max_length    = updatedValue
    elif updateConfigAction == configThreshold:
        breakGlass.threshold                            = updatedValue

    await breakGlass.save()
