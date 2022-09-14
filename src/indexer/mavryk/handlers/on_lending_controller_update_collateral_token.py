
from dipdup.context import HandlerContext
from mavryk.types.lending_controller.parameter.update_collateral_token import UpdateCollateralTokenParameter
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage

async def on_lending_controller_update_collateral_token(
    ctx: HandlerContext,
    update_collateral_token: Transaction[UpdateCollateralTokenParameter, LendingControllerStorage],
) -> None:

    breakpoint()
