
from dipdup.models import Origination
from mavryk.types.doorman.storage import DoormanStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_doorman_origination(
    ctx: HandlerContext,
    doorman_origination: Origination[DoormanStorage],
) -> None:

    # Get operation values
    doorman_address                 = doorman_origination.data.originated_contract_address
    admin                           = doorman_origination.storage.admin
    governance_address              = doorman_origination.storage.governanceAddress
    min_mvk_amount                  = int(doorman_origination.storage.config.minMvkAmount)
    unclaimed_rewards               = int(doorman_origination.storage.unclaimedRewards)
    accumulated_fees_per_share      = int(doorman_origination.storage.accumulatedFeesPerShare)
    stake_paused                    = doorman_origination.storage.breakGlassConfig.stakeIsPaused
    unstake_paused                  = doorman_origination.storage.breakGlassConfig.unstakeIsPaused
    compound_paused                 = doorman_origination.storage.breakGlassConfig.compoundIsPaused

    # Get or create governance record
    governance, _ = await models.Governance.get_or_create(address=governance_address)
    await governance.save();

    # Save Doorman in DB
    doorman = models.Doorman(
        address                     = doorman_address,
        admin                       = admin,
        governance                  = governance,
        min_mvk_amount              = min_mvk_amount,
        unclaimed_rewards           = unclaimed_rewards,
        accumulated_fees_per_share  = accumulated_fees_per_share,
        stake_paused                = stake_paused,
        unstake_paused              = unstake_paused,
        compound_paused             = compound_paused
    )
    await doorman.save()
