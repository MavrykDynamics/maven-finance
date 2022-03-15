
from mavryk.types.council.storage import CouncilStorage
from dipdup.models import Origination
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_council_origination(
    ctx: HandlerContext,
    council_origination: Origination[CouncilStorage],
) -> None:
    # Get operation values
    councilAddress              = council_origination.data.originated_contract_address
    councilThreshold            = int(council_origination.storage.config.threshold)
    councilActionExpiryDays     = int(council_origination.storage.config.actionExpiryDays)
    councilActionCounter        = int(council_origination.storage.actionCounter)
    councilMembers              = council_origination.storage.councilMembers

    # Update and create record
    council = models.Council(
        address                 = councilAddress,
        threshold               = councilThreshold,
        action_expiry_days      = councilActionExpiryDays,
        action_counter          = councilActionCounter
    )
    await council.save()

    for member in councilMembers:
        user, _ = await models.MavrykUser.get_or_create(
            address = member
        )
        user.council    = council
        await user.save()
