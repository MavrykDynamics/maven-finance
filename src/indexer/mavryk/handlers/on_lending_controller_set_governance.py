
from dipdup.context import HandlerContext
from mavryk.types.lending_controller.storage import LendingControllerStorage
from dipdup.models import Transaction
from mavryk.types.lending_controller.parameter.set_governance import SetGovernanceParameter

async def on_lending_controller_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, LendingControllerStorage],
) -> None:

    breakpoint()
