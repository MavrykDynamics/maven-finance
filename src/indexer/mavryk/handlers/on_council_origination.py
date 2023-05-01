from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_contract_metadata
from mavryk.types.council.storage import CouncilStorage
from dipdup.models import Origination
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_council_origination(
    ctx: HandlerContext,
    council_origination: Origination[CouncilStorage],
) -> None:

    try:
        # Get operation values
        address                             = council_origination.data.originated_contract_address
        admin                               = council_origination.storage.admin
        governance_address                  = council_origination.storage.governanceAddress
        threshold                           = int(council_origination.storage.config.threshold)
        action_expiry_days                  = int(council_origination.storage.config.actionExpiryDays)
        council_member_name_max_length      = int(council_origination.storage.config.councilMemberNameMaxLength)
        council_member_website_max_length   = int(council_origination.storage.config.councilMemberWebsiteMaxLength)
        council_member_image_max_length     = int(council_origination.storage.config.councilMemberImageMaxLength)
        request_purpose_max_length          = int(council_origination.storage.config.requestPurposeMaxLength)
        request_token_name_max_length       = int(council_origination.storage.config.requestTokenNameMaxLength)
        action_counter                      = int(council_origination.storage.actionCounter)
        council_members                     = council_origination.storage.councilMembers
        timestamp                           = council_origination.data.timestamp
    
        # Persist contract metadata
        await persist_contract_metadata(
            ctx=ctx,
            contract_address=address
        )
        
        # Get or create governance record
        governance, _ = await models.Governance.get_or_create(address=governance_address)
        await governance.save();
    
        # Update and create record
        council = models.Council(
            address                             = address,
            admin                               = admin,
            last_updated_at                     = timestamp,
            governance                          = governance,
            threshold                           = threshold,
            action_expiry_days                  = action_expiry_days,
            action_counter                      = action_counter,
            council_member_name_max_length      = council_member_name_max_length,
            council_member_website_max_length   = council_member_website_max_length,
            council_member_image_max_length     = council_member_image_max_length,
            request_purpose_max_length          = request_purpose_max_length,
            request_token_name_max_length       = request_token_name_max_length
        )
        await council.save()
    
        for member_address in council_members:
            user            = await models.mavryk_user_cache.get(address=member_address)
            user.council    = council
            await user.save()
    
            memberInfo          = council_members[member_address]
            council_member      = await models.CouncilCouncilMember(
                user        = user,
                council     = council,
                name        = memberInfo.name,
                website     = memberInfo.website,
                image       = memberInfo.image
            )
            await council_member.save()

    except BaseException as e:
         await save_error_report(e)

