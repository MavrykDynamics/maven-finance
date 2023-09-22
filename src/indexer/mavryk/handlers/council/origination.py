from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.contracts import get_contract_metadata
from mavryk.types.council.tezos_storage import CouncilStorage
from dipdup.models.tezos_tzkt import TzktOrigination
from dipdup.context import HandlerContext
import mavryk.models as models

async def origination(
    ctx: HandlerContext,
    council_origination: TzktOrigination[CouncilStorage],
) -> None:

    try:
        # Get operation values
        address                             = council_origination.data.originated_contract_address
        admin                               = council_origination.storage.admin
        threshold                           = int(council_origination.storage.config.threshold)
        action_expiry_days                  = int(council_origination.storage.config.actionExpiryDays)
        council_member_name_max_length      = int(council_origination.storage.config.councilMemberNameMaxLength)
        council_member_website_max_length   = int(council_origination.storage.config.councilMemberWebsiteMaxLength)
        council_member_image_max_length     = int(council_origination.storage.config.councilMemberImageMaxLength)
        request_purpose_max_length          = int(council_origination.storage.config.requestPurposeMaxLength)
        request_token_name_max_length       = int(council_origination.storage.config.requestTokenNameMaxLength)
        action_counter                      = int(council_origination.storage.actionCounter)
        council_members                     = council_origination.storage.councilMembers
        council_size                        = int(council_origination.storage.councilSize)
        timestamp                           = council_origination.data.timestamp
    
        # Get contract metadata
        contract_metadata = await get_contract_metadata(
            ctx=ctx,
            contract_address=address
        )
        
        # Get governance record
        governance                  = await models.Governance.get(network = ctx.datasource.network)
    
        # Update and create record
        council = models.Council(
            address                             = address,
            network                             = ctx.datasource.network,
            metadata                            = contract_metadata,
            admin                               = admin,
            last_updated_at                     = timestamp,
            governance                          = governance,
            threshold                           = threshold,
            action_expiry_days                  = action_expiry_days,
            action_counter                      = action_counter,
            council_size                        = council_size,
            council_member_name_max_length      = council_member_name_max_length,
            council_member_website_max_length   = council_member_website_max_length,
            council_member_image_max_length     = council_member_image_max_length,
            request_purpose_max_length          = request_purpose_max_length,
            request_token_name_max_length       = request_token_name_max_length
        )
        await council.save()
    
        for member_address in council_members:
            user            = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=member_address)
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

