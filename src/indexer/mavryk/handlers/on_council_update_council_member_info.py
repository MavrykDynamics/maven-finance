from mavryk.utils.error_reporting import save_error_report

from mavryk.types.council.parameter.update_council_member_info import UpdateCouncilMemberInfoParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.council.storage import CouncilStorage
import mavryk.models as models

async def on_council_update_council_member_info(
    ctx: HandlerContext,
    update_council_member_info: Transaction[UpdateCouncilMemberInfoParameter, CouncilStorage],
) -> None:

    try:
        # Get operation info
        council_address         = update_council_member_info.data.target_address
        council_member_address  = update_council_member_info.data.sender_address
        council_member_storage  = update_council_member_info.storage.councilMembers[council_member_address]
        name                    = council_member_storage.name
        website                 = council_member_storage.website
        image                   = council_member_storage.image
    
        # Update record
        council                 = await models.Council.get(network=ctx.datasource.network, address= council_address)
        user                    = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=council_member_address)
        council_member          = await models.CouncilCouncilMember.filter(
            council     = council,
            user        = user
        ).first()
        council_member.name     = name
        council_member.website  = website
        council_member.image    = image
        await council_member.save()
    except BaseException as e:
         await save_error_report(e)

