
from dipdup.models import Transaction
from mavryk.types.vault.storage import VaultStorage
from dipdup.context import HandlerContext
from mavryk.types.vault.parameter.set_governance import SetGovernanceParameter

async def on_vault_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, VaultStorage],
) -> None:
    
    breakpoint()
