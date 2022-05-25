
from unicodedata import name
from dipdup.models import Origination
from dipdup.context import HandlerContext
from mavryk.types.break_glass.storage import BreakGlassStorage
import mavryk.models as models

async def on_break_glass_origination(
    ctx: HandlerContext,
    break_glass_origination: Origination[BreakGlassStorage],
) -> None:

    # Get operation values
    address                             = break_glass_origination.data.originated_contract_address
    admin                               = break_glass_origination.storage.admin
    governance_address                  = break_glass_origination.storage.governanceAddress
    threshold                           = int(break_glass_origination.storage.config.threshold)
    action_expiry_days                  = int(break_glass_origination.storage.config.actionExpiryDays)
    council_member_name_max_length      = int(break_glass_origination.storage.config.councilMemberNameMaxLength)
    council_member_website_max_length   = int(break_glass_origination.storage.config.councilMemberWebsiteMaxLength)
    council_member_image_max_length     = int(break_glass_origination.storage.config.councilMemberImageMaxLength)
    glass_broken                        = break_glass_origination.storage.glassBroken
    action_counter                      = break_glass_origination.storage.actionCounter
    council_members                     = break_glass_origination.storage.councilMembers

    # Get or create governance record
    governance, _ = await models.Governance.get_or_create(address=governance_address)
    await governance.save();

    # Create record
    break_glass  = models.BreakGlass(
        address                             = address,
        admin                               = admin,
        governance                          = governance,
        threshold                           = threshold,
        action_expiry_days                  = action_expiry_days,
        council_member_name_max_length      = council_member_name_max_length,
        council_member_website_max_length   = council_member_website_max_length,
        council_member_image_max_length     = council_member_image_max_length,
        glass_broken                        = glass_broken,
        action_counter                      = action_counter,
    )
    await break_glass.save()

    for member_address in council_members:
        user, _             = await models.MavrykUser.get_or_create(
            address = member_address
        )
        await user.save()

        memberInfo          = council_members[member_address]
        council_member      = await models.BreakGlassCouncilMember(
            user        = user,
            break_glass = break_glass,
            name        = memberInfo.name,
            website     = memberInfo.website,
            image       = memberInfo.image
        )
        await council_member.save()
