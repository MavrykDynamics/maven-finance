from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.types.council.tezos_parameters.update_config import UpdateConfigParameter
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.council.tezos_storage import CouncilStorage
import mavryk.models as models

async def update_config(
    ctx: HandlerContext,
    update_config: TzktTransaction[UpdateConfigParameter, CouncilStorage],
) -> None:

    try:
        # Get operation values
        council_address         = update_config.data.target_address
        timestamp               = update_config.data.timestamp
    
        # Update contract
        await models.Council.filter(
            network = ctx.datasource.network,
            address = council_address
        ).update(
            last_updated_at                     = timestamp,
            threshold                           = update_config.storage.config.threshold,
            action_expiry_days                  = update_config.storage.config.actionExpiryDays,
            council_member_name_max_length      = update_config.storage.config.councilMemberNameMaxLength,
            council_member_website_max_length   = update_config.storage.config.councilMemberWebsiteMaxLength,
            council_member_image_max_length     = update_config.storage.config.councilMemberImageMaxLength,
            request_purpose_max_length          = update_config.storage.config.requestPurposeMaxLength,
            request_token_name_max_length       = update_config.storage.config.requestTokenNameMaxLength,
        )

    except BaseException as e:
        await save_error_report(e)

