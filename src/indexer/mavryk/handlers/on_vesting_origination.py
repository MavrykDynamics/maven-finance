
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
    vestingBlocksPerMinute              = int(vesting_origination.storage.config.blocksPerMinute)
    vestingBlocksPerMonth               = int(vesting_origination.storage.config.blocksPerMonth)
    vestingDefaultCliffPeriod           = int(vesting_origination.storage.config.defaultCliffPeriod)
    vestingDefaultCooldownPeriod        = int(vesting_origination.storage.config.defaultCooldownPeriod)
    vestingNewBlocktimeLevel            = int(vesting_origination.storage.config.newBlockTimeLevel)
    vestingNewBlockPerMinute            = int(vesting_origination.storage.config.newBlocksPerMinute)
    vestingTotalVestedAmount            = int(vesting_origination.storage.totalVestedAmount)

    # Create record
    vesting = models.Vesting(
        address                         = vestingAddress,
        blocks_per_minute               = vestingBlocksPerMinute,
        blocks_per_month                = vestingBlocksPerMonth,
        default_cliff_period            = vestingDefaultCliffPeriod,
        default_cooldown_period         = vestingDefaultCooldownPeriod,
        new_blocktime_level             = vestingNewBlocktimeLevel,
        new_block_per_minute            = vestingNewBlockPerMinute,
        total_vested_amount             = vestingTotalVestedAmount
    )
    await vesting.save()
