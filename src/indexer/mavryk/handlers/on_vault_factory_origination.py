
from mavryk.types.vault_factory.storage import VaultFactoryStorage
from dipdup.models import Origination
from dipdup.context import HandlerContext

async def on_vault_factory_origination(
    ctx: HandlerContext,
    vault_factory_origination: Origination[VaultFactoryStorage],
) -> None:
    ...