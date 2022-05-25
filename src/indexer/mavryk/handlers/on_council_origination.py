
from mavryk.types.council.storage import CouncilStorage
from dipdup.models import Origination
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_council_origination(
    ctx: HandlerContext,
    council_origination: Origination[CouncilStorage],
) -> None:

    # Get operation values
    address                 = council_origination.data.originated_contract_address
    admin                   = council_origination.storage.admin
    governance_address      = council_origination.storage.governanceAddress
    threshold               = int(council_origination.storage.config.threshold)
    action_expiry_days      = int(council_origination.storage.config.actionExpiryDays)
    action_counter          = int(council_origination.storage.actionCounter)
    council_members         = council_origination.storage.councilMembers

    # Get or create governance record
    governance, _ = await models.Governance.get_or_create(address=governance_address)
    await governance.save();

    # Update and create record
    council = models.Council(
        address                 = address,
        admin                   = admin,
        governance              = governance,
        threshold               = threshold,
        action_expiry_days      = action_expiry_days,
        action_counter          = action_counter
    )
    await council.save()

    for member in council_members:
        user, _ = await models.MavrykUser.get_or_create(
            address = member
        )
        user.council    = council
        await user.save()
