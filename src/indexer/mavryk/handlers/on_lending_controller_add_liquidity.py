
from dipdup.context import HandlerContext
from mavryk.types.lending_controller.parameter.add_liquidity import AddLiquidityParameter
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage

async def on_lending_controller_add_liquidity(
    ctx: HandlerContext,
    add_liquidity: Transaction[AddLiquidityParameter, LendingControllerStorage],
) -> None:

    breakpoint()
