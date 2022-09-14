
from dipdup.context import HandlerContext
from mavryk.types.lending_controller.parameter.set_lambda import SetLambdaParameter
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage

async def on_lending_controller_set_lambda(
    ctx: HandlerContext,
    set_lambda: Transaction[SetLambdaParameter, LendingControllerStorage],
) -> None:

    breakpoint()
