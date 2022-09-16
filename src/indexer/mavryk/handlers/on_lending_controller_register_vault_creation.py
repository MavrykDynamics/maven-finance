
from mavryk.types.lending_controller.parameter.register_vault_creation import RegisterVaultCreationParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage

async def on_lending_controller_register_vault_creation(
    ctx: HandlerContext,
    register_vault_creation: Transaction[RegisterVaultCreationParameter, LendingControllerStorage],
) -> None:

    breakpoint()
