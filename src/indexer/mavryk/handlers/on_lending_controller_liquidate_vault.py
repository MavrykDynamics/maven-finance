
from dipdup.context import HandlerContext
from mavryk.types.lending_controller.parameter.liquidate_vault import LiquidateVaultParameter
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage

async def on_lending_controller_liquidate_vault(
    ctx: HandlerContext,
    liquidate_vault: Transaction[LiquidateVaultParameter, LendingControllerStorage],
) -> None:

    # TODO: Implement
    # Get operation info
    # breakpoint()
    ...
