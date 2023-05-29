from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.types.council.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configActionExpiryDays, UpdateConfigActionItem1 as configCouncilImageMaxLength, UpdateConfigActionItem2 as configCouncilNameMaxLength, UpdateConfigActionItem3 as configCouncilWebsiteMaxLength, UpdateConfigActionItem4 as configRequestPurposeMaxLength, UpdateConfigActionItem5 as configRequestTokenNameMaxLength, UpdateConfigActionItem6 as configThreshold
from dipdup.models import Transaction
from mavryk.types.council.storage import CouncilStorage
import mavryk.models as models

async def on_council_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, CouncilStorage],
) -> None:

    try:
        # Get operation values
        council_address         = update_config.data.target_address
        updated_value           = int(update_config.parameter.updateConfigNewValue)
        update_config_action    = type(update_config.parameter.updateConfigAction)
        timestamp               = update_config.data.timestamp
    
        # Update contract
        council = await models.Council.get(
            network = ctx.datasource.network,
            address = council_address
        )
        council.last_updated_at = timestamp 
        if update_config_action == configActionExpiryDays:
            council.action_expiry_days                  = updated_value
        elif update_config_action == configCouncilImageMaxLength:
            council.council_member_image_max_length     = updated_value
        elif update_config_action == configCouncilNameMaxLength:
            council.council_member_name_max_length      = updated_value
        elif update_config_action == configCouncilWebsiteMaxLength:
            council.council_member_website_max_length   = updated_value
        elif update_config_action == configRequestPurposeMaxLength:
            council.request_purpose_max_length          = updated_value
        elif update_config_action == configRequestTokenNameMaxLength:
            council.request_token_name_max_length       = updated_value
        elif update_config_action == configThreshold:
            council.threshold                           = updated_value
    
        await council.save()
    except BaseException as e:
         await save_error_report(e)

