
from dipdup.context import HandlerContext
from mavryk.types.lending_controller.parameter.mark_for_liquidation import MarkForLiquidationParameter
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage

async def on_lending_controller_mark_for_liquidation(
    ctx: HandlerContext,
    mark_for_liquidation: Transaction[MarkForLiquidationParameter, LendingControllerStorage],
) -> None:

    # TODO: Implement
    # Get operation info
    # breakpoint()
    ...
