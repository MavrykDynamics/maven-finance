
from dipdup.context import HandlerContext
from mavryk.types.lending_controller.parameter.set_admin import SetAdminParameter
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage

async def on_lending_controller_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, LendingControllerStorage],
) -> None:

    breakpoint()
