
from dipdup.context import HandlerContext
from mavryk.types.lending_controller.parameter.register_deposit import RegisterDepositParameter
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage

async def on_lending_controller_register_deposit(
    ctx: HandlerContext,
    register_deposit: Transaction[RegisterDepositParameter, LendingControllerStorage],
) -> None:

    breakpoint()
