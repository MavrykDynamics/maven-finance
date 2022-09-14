
from dipdup.models import Transaction
from mavryk.types.vault.parameter.set_admin import SetAdminParameter
from mavryk.types.vault.storage import VaultStorage
from dipdup.context import HandlerContext

async def on_vault_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, VaultStorage],
) -> None:
    
    breakpoint()
