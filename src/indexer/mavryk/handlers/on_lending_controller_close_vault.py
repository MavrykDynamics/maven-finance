
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.lending_controller.parameter.close_vault import CloseVaultParameter
from mavryk.types.lending_controller.storage import LendingControllerStorage

async def on_lending_controller_close_vault(
    ctx: HandlerContext,
    close_vault: Transaction[CloseVaultParameter, LendingControllerStorage],
) -> None:

    breakpoint()
