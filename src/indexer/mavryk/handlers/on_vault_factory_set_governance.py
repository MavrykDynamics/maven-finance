
from mavryk.types.vault_factory.storage import VaultFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.vault_factory.parameter.set_governance import SetGovernanceParameter

async def on_vault_factory_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, VaultFactoryStorage],
) -> None:
    ...