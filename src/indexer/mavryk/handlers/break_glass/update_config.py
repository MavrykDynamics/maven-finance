from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.break_glass.parameter.update_config import UpdateConfigParameter
from mavryk.types.break_glass.storage import BreakGlassStorage
import mavryk.models as models

async def update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, BreakGlassStorage],
) -> None:

    try:
        # Get operation values
        break_glass_address     = update_config.data.target_address
        timestamp               = update_config.data.timestamp
    
        # Update contract
        await models.BreakGlass.filter(
            network = ctx.datasource.network,
            address = break_glass_address
        ).update(
            last_updated_at                     = timestamp,
            threshold                           = update_config.storage.config.threshold,
            action_expiry_days                  = update_config.storage.config.actionExpiryDays,
            council_member_name_max_length      = update_config.storage.config.councilMemberNameMaxLength,
            council_member_website_max_length   = update_config.storage.config.councilMemberWebsiteMaxLength,
            council_member_image_max_length     = update_config.storage.config.councilMemberImageMaxLength,
        )

    except BaseException as e:
        await save_error_report(e)

