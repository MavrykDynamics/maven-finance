
from mavryk.types.vault_factory.storage import VaultFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.vault_factory.parameter.set_admin import SetAdminParameter

async def on_vault_factory_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, VaultFactoryStorage],
) -> None:
    ...