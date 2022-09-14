
from dipdup.context import HandlerContext
from mavryk.types.lending_controller.parameter.set_product_lambda import SetProductLambdaParameter
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage

async def on_lending_controller_set_product_lambda(
    ctx: HandlerContext,
    set_product_lambda: Transaction[SetProductLambdaParameter, LendingControllerStorage],
) -> None:

    breakpoint()
