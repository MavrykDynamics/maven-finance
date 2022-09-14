
from dipdup.context import HandlerContext
from mavryk.types.lending_controller.parameter.update_config import UpdateConfigParameter
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage

async def on_lending_controller_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, LendingControllerStorage],
) -> None:

    breakpoint()
