
from mavryk.types.vault.storage import VaultStorage
from dipdup.context import HandlerContext
from dipdup.models import Origination

async def on_vault_origination(
    ctx: HandlerContext,
    vault_origination: Origination[VaultStorage],
) -> None:
    
    breakpoint()
