
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.lending_controller.parameter.set_loan_token import SetLoanTokenParameter
from mavryk.types.lending_controller.storage import LendingControllerStorage

async def on_lending_controller_set_loan_token(
    ctx: HandlerContext,
    set_loan_token: Transaction[SetLoanTokenParameter, LendingControllerStorage],
) -> None:

    breakpoint()
