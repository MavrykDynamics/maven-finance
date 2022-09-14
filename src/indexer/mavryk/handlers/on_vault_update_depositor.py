
from mavryk.types.vault.parameter.update_depositor import UpdateDepositorParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.vault.storage import VaultStorage

async def on_vault_update_depositor(
    ctx: HandlerContext,
    update_depositor: Transaction[UpdateDepositorParameter, VaultStorage],
) -> None:
    
    breakpoint()
