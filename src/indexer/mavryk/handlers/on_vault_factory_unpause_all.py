
from mavryk.types.vault_factory.storage import VaultFactoryStorage
from mavryk.types.vault_factory.parameter.unpause_all import UnpauseAllParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction

async def on_vault_factory_unpause_all(
    ctx: HandlerContext,
    unpause_all: Transaction[UnpauseAllParameter, VaultFactoryStorage],
) -> None:

    breakpoint()
