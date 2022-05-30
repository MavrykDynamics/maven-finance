
from dipdup.context import HandlerContext
from mavryk.types.council.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configActionExpiryDays, UpdateConfigActionItem1 as configCouncilImageMaxLength, UpdateConfigActionItem2 as configCouncilNameMaxLength, UpdateConfigActionItem3 as configCouncilWebsiteMaxLength, UpdateConfigActionItem4 as configRequestPurposeMaxLength, UpdateConfigActionItem5 as configRequestTokenNameMaxLength, UpdateConfigActionItem6 as configThreshold
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
        council.action_expiry_days                  = updatedValue
    elif updateConfigAction == configCouncilImageMaxLength:
        council.council_member_image_max_length     = updatedValue
    elif updateConfigAction == configCouncilNameMaxLength:
        council.council_member_name_max_length      = updatedValue
    elif updateConfigAction == configCouncilWebsiteMaxLength:
        council.council_member_website_max_length   = updatedValue
    elif updateConfigAction == configRequestPurposeMaxLength:
        council.request_purpose_max_length          = updatedValue
    elif updateConfigAction == configRequestTokenNameMaxLength:
        council.request_token_name_max_length       = updatedValue
    elif updateConfigAction == configThreshold:
        council.threshold                           = updatedValue

    await council.save()