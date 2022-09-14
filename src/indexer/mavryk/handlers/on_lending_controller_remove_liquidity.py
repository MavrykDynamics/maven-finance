
from mavryk.types.lending_controller.parameter.remove_liquidity import RemoveLiquidityParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage

async def on_lending_controller_remove_liquidity(
    ctx: HandlerContext,
    remove_liquidity: Transaction[RemoveLiquidityParameter, LendingControllerStorage],
) -> None:

    breakpoint()
