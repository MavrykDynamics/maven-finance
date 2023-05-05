from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.break_glass.parameter.update_council_member_info import UpdateCouncilMemberInfoParameter
from mavryk.types.break_glass.storage import BreakGlassStorage
import mavryk.models as models

async def on_break_glass_update_council_member_info(
    ctx: HandlerContext,
    update_council_member_info: Transaction[UpdateCouncilMemberInfoParameter, BreakGlassStorage],
) -> None:

    try:
        # Get operation info
        break_glass_address     = update_council_member_info.data.target_address
        council_member_address  = update_council_member_info.data.sender_address
        council_member_storage  = update_council_member_info.storage.councilMembers[council_member_address]
        name                    = council_member_storage.name
        website                 = council_member_storage.website
        image                   = council_member_storage.image
    
        # Update record
        break_glass             = await models.BreakGlass.get(address   = break_glass_address)
        user                    = await models.mavryk_user_cache.get(address=council_member_address)
        council_member          = await models.BreakGlassCouncilMember.get(
            break_glass = break_glass,
            user        = user
        )
        council_member.name     = name
        council_member.website  = website
        council_member.image    = image
        await council_member.save()

    except BaseException as e:
         await save_error_report(e)

