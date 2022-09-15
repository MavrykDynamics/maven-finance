
from mavryk.types.vault_factory.storage import VaultFactoryStorage
from mavryk.types.vault_factory.parameter.pause_all import PauseAllParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction

async def on_vault_factory_pause_all(
    ctx: HandlerContext,
    pause_all: Transaction[PauseAllParameter, VaultFactoryStorage],
) -> None:
    ...