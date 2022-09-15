
from mavryk.types.vault_factory.storage import VaultFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.vault_factory.parameter.update_general_contracts import UpdateGeneralContractsParameter

async def on_vault_factory_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, VaultFactoryStorage],
) -> None:
    ...