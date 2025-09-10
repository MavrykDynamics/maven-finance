from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos import TezosOrigination
from dipdup.context import HandlerContext
from maven.utils.contracts import get_contract_metadata
from maven.types.break_glass.tezos_storage import BreakGlassStorage
from maven import models as models

async def origination(
    ctx: HandlerContext,
    break_glass_origination: TezosOrigination[BreakGlassStorage],
) -> None:

    try:
        # Get operation values
        address                             = break_glass_origination.data.originated_contract_address
        admin                               = break_glass_origination.storage.admin
        threshold                           = int(break_glass_origination.storage.config.threshold)
        action_expiry_days                  = int(break_glass_origination.storage.config.actionExpiryDays)
        council_member_name_max_length      = int(break_glass_origination.storage.config.councilMemberNameMaxLength)
        council_member_website_max_length   = int(break_glass_origination.storage.config.councilMemberWebsiteMaxLength)
        council_member_image_max_length     = int(break_glass_origination.storage.config.councilMemberImageMaxLength)
        glass_broken                        = break_glass_origination.storage.glassBroken
        action_counter                      = break_glass_origination.storage.actionCounter
        council_members                     = break_glass_origination.storage.councilMembers
        council_size                        = int(break_glass_origination.storage.councilSize)
        timestamp                           = break_glass_origination.data.timestamp
    
        # Get contract metadata
        contract_metadata = await get_contract_metadata(
            ctx=ctx,
            contract_address=address
        )
    
        # Get governance record
        governance                  = await models.Governance.get(network = 'atlasnet')
    
        # Create record
        break_glass  = models.BreakGlass(
            address                             = address,
            network                             = 'atlasnet',
            metadata                            = contract_metadata,
            admin                               = admin,
            last_updated_at                     = timestamp,
            governance                          = governance,
            threshold                           = threshold,
            action_expiry_days                  = action_expiry_days,
            council_member_name_max_length      = council_member_name_max_length,
            council_member_website_max_length   = council_member_website_max_length,
            council_member_image_max_length     = council_member_image_max_length,
            council_size                        = council_size,
            glass_broken                        = glass_broken,
            action_counter                      = action_counter,
        )
        await break_glass.save()
    
        for member_address in council_members:
            user                = await models.get_user(network='atlasnet', address=member_address)
            memberInfo          = council_members[member_address]
            council_member      = models.BreakGlassCouncilMember(
                user        = user,
                break_glass = break_glass,
                name        = memberInfo.name,
                website     = memberInfo.website,
                image       = memberInfo.image
            )
            await council_member.save()

    except BaseException as e:
        await save_error_report(e)

