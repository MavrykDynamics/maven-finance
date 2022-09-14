
from dipdup.context import HandlerContext
from mavryk.types.lending_controller.parameter.pause_all import PauseAllParameter
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage

async def on_lending_controller_pause_all(
    ctx: HandlerContext,
    pause_all: Transaction[PauseAllParameter, LendingControllerStorage],
) -> None:

    breakpoint()
