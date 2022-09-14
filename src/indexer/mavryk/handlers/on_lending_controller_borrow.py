
from mavryk.types.lending_controller.parameter.borrow import BorrowParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage

async def on_lending_controller_borrow(
    ctx: HandlerContext,
    borrow: Transaction[BorrowParameter, LendingControllerStorage],
) -> None:

    breakpoint()
