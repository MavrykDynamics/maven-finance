
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.lending_controller.parameter.register_withdrawal import RegisterWithdrawalParameter
from mavryk.types.lending_controller.storage import LendingControllerStorage

async def on_lending_controller_register_withdrawal(
    ctx: HandlerContext,
    register_withdrawal: Transaction[RegisterWithdrawalParameter, LendingControllerStorage],
) -> None:

    breakpoint()
