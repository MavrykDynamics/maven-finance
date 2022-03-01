
from dipdup.models import Origination
from mavryk.types.doorman.storage import DoormanStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_doorman_origination(
    ctx: HandlerContext,
    doorman_origination: Origination[DoormanStorage],
) -> None:
    doorman_address = doorman_origination.data.originated_contract_address
    min_mvk_amount = int(doorman_origination.data.storage['minMvkAmount'])
    unclaimed_rewards = int(doorman_origination.data.storage['unclaimedRewards'])
    accumulated_fees_per_share = int(doorman_origination.data.storage['accumulatedFeesPerShare'])
    stake_paused = doorman_origination.data.storage['breakGlassConfig']['stakeIsPaused']
    unstake_paused = doorman_origination.data.storage['breakGlassConfig']['unstakeIsPaused']
    compound_paused = doorman_origination.data.storage['breakGlassConfig']['compoundIsPaused']

    # Save Doorman in DB
    doorman = models.Doorman(
        address=doorman_address,
        min_mvk_amount=min_mvk_amount,
        unclaimed_rewards=unclaimed_rewards,
        accumulated_fees_per_share=accumulated_fees_per_share,
        stake_paused=stake_paused,
        unstake_paused=unstake_paused,
        compound_paused=compound_paused
    )
    await doorman.save()
