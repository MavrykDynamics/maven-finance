
from dipdup.context import HandlerContext
from mavryk.types.lending_controller.parameter.unpause_all import UnpauseAllParameter
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage

async def on_lending_controller_unpause_all(
    ctx: HandlerContext,
    unpause_all: Transaction[UnpauseAllParameter, LendingControllerStorage],
) -> None:

    breakpoint()
