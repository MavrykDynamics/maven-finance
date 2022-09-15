
from mavryk.types.vault_factory.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from mavryk.types.vault_factory.storage import VaultFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction

async def on_vault_factory_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, VaultFactoryStorage],
) -> None:
    ...