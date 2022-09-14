
from dipdup.context import HandlerContext
from mavryk.types.lending_controller.parameter.repay import RepayParameter
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage

async def on_lending_controller_repay(
    ctx: HandlerContext,
    repay: Transaction[RepayParameter, LendingControllerStorage],
) -> None:

    breakpoint()
