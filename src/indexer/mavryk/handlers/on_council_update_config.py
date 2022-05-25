
from dipdup.context import HandlerContext
from mavryk.types.council.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configActionExpiryDays, UpdateConfigActionItem1 as configThreshold
from dipdup.models import Transaction
from mavryk.types.council.storage import CouncilStorage
import mavryk.models as models

async def on_council_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, CouncilStorage],
) -> None:

    # Get operation values
    councilAddress          = update_config.data.target_address
    updatedValue            = int(update_config.parameter.updateConfigNewValue)
    updateConfigAction      = type(update_config.parameter.updateConfigAction)

    # Update contract
    council = await models.Council.get(
        address = councilAddress
    )
    if updateConfigAction == configActionExpiryDays:
        council.action_expiry_days      = updatedValue
    elif updateConfigAction == configThreshold:
        council.threshold               = updatedValue

    await council.save()