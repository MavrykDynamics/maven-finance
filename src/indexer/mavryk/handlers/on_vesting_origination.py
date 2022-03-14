
from mavryk.types.vesting.storage import VestingStorage
from dipdup.models import Origination
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_vesting_origination(
    ctx: HandlerContext,
    vesting_origination: Origination[VestingStorage],
) -> None:
    # Get operation values
    vestingAddress                      = vesting_origination.data.originated_contract_address
    vestingDefaultCliffPeriod           = int(vesting_origination.storage.config.defaultCliffPeriod)
    vestingDefaultCooldownPeriod        = int(vesting_origination.storage.config.defaultCooldownPeriod)
    vestingTotalVestedAmount            = int(vesting_origination.storage.totalVestedAmount)

    # Create record
    vesting = models.Vesting(
        address                         = vestingAddress,
        default_cliff_period            = vestingDefaultCliffPeriod,
        default_cooldown_period         = vestingDefaultCooldownPeriod,
        total_vested_amount             = vestingTotalVestedAmount
    )
    await vesting.save()
