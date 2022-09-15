
from mavryk.types.vesting.storage import VestingStorage
from dipdup.models import Origination
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_vesting_origination(
    ctx: HandlerContext,
    vesting_origination: Origination[VestingStorage],
) -> None:

    # Get operation values
    address                         = vesting_origination.data.originated_contract_address
    admin                           = vesting_origination.storage.admin
    governance_address              = vesting_origination.storage.governanceAddress
    total_vested_amount             = int(vesting_origination.storage.totalVestedAmount)
    timestamp                       = vesting_origination.data.timestamp

    # Get or create governance record
    governance, _ = await models.Governance.get_or_create(address=governance_address)
    await governance.save();

    # Create record
    vesting = models.Vesting(
        address                         = address,
        admin                           = admin,
        last_updated_at                 = timestamp,
        governance                      = governance,
        total_vested_amount             = total_vested_amount
    )
    await vesting.save()
