
from mavryk.types.vault_factory.storage import VaultFactoryStorage
from mavryk.types.vault_factory.parameter.update_config import UpdateConfigParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction

async def on_vault_factory_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, VaultFactoryStorage],
) -> None:

    breakpoint()
