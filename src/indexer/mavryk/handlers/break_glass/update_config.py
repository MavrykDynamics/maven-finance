from mavryk.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext
from mavryk.types.break_glass.tezos_parameters.update_config import UpdateConfigParameter
from mavryk.types.break_glass.tezos_storage import BreakGlassStorage
import mavryk.models as models

async def update_config(
    ctx: HandlerContext,
    update_config: TzktTransaction[UpdateConfigParameter, BreakGlassStorage],
) -> None:

    try:
        # Get operation values
        break_glass_address     = update_config.data.target_address
        timestamp               = update_config.data.timestamp
    
        # Update contract
        await models.BreakGlass.filter(
            network = ctx.datasource.name.replace('tzkt_',''),
            address = break_glass_address
        ).update(
            last_updated_at                     = timestamp,
            threshold                           = update_config.storage.config.threshold,
            action_expiry_days                  = update_config.storage.config.actionExpiryDays,
            council_member_name_max_length      = update_config.storage.config.councilMemberNameMaxLength,
            council_member_website_max_length   = update_config.storage.config.councilMemberWebsiteMaxLength,
            council_member_image_max_length     = update_config.storage.config.councilMemberImageMaxLength,
        )

        # Update threshold for current actions
        break_glass = await models.Council.get(
            network = ctx.datasource.name.replace('tzkt_',''),
            address = break_glass_address
        )
        await models.BreakGlassAction.filter(
            break_glass                 = break_glass,
            status                      = models.ActionStatus.PENDING,
            expiration_datetime__lte    = timestamp
        ).update(
            registered_threshold        = break_glass.threshold
        )

    except BaseException as e:
        await save_error_report(e)

