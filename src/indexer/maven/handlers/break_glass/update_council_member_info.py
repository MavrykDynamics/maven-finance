from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.break_glass.tezos_parameters.update_council_member_info import UpdateCouncilMemberInfoParameter
from maven.types.break_glass.tezos_storage import BreakGlassStorage
from maven import models as models

async def update_council_member_info(
    ctx: HandlerContext,
    update_council_member_info: TezosTransaction[UpdateCouncilMemberInfoParameter, BreakGlassStorage],
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
        break_glass             = await models.BreakGlass.get(network='atlasnet', address= break_glass_address)
        user                    = await models.get_user(network='atlasnet', address=council_member_address)
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

