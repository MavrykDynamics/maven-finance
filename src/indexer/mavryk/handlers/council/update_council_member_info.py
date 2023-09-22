from mavryk.utils.error_reporting import save_error_report

from mavryk.types.council.tezos_parameters.update_council_member_info import UpdateCouncilMemberInfoParameter
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.council.tezos_storage import CouncilStorage
import mavryk.models as models

async def update_council_member_info(
    ctx: HandlerContext,
    update_council_member_info: TzktTransaction[UpdateCouncilMemberInfoParameter, CouncilStorage],
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
        council                 = await models.Council.get(network=ctx.datasource.name.replace('tzkt_',''), address= council_address)
        user                    = await models.mavryk_user_cache.get(network=ctx.datasource.name.replace('tzkt_',''), address=council_member_address)
        await models.CouncilCouncilMember.filter(
            council     = council,
            user        = user
        ).update(
            name     = name,
            website  = website,
            image    = image
        )

    except BaseException as e:
        await save_error_report(e)

