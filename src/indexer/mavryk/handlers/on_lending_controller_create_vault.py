
from dipdup.context import HandlerContext
from mavryk.types.lending_controller.parameter.create_vault import CreateVaultParameter
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage

async def on_lending_controller_create_vault(
    ctx: HandlerContext,
    create_vault: Transaction[CreateVaultParameter, LendingControllerStorage],
) -> None:

    breakpoint()
