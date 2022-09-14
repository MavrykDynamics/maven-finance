
from dipdup.context import HandlerContext
from mavryk.types.lending_controller.storage import LendingControllerStorage
from dipdup.models import Transaction
from mavryk.types.lending_controller.parameter.claim_rewards import ClaimRewardsParameter

async def on_lending_controller_claim_rewards(
    ctx: HandlerContext,
    claim_rewards: Transaction[ClaimRewardsParameter, LendingControllerStorage],
) -> None:

    breakpoint()
