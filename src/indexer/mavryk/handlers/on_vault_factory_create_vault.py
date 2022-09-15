
from dipdup.models import Origination
from mavryk.types.vault_factory.parameter.create_vault import CreateVaultParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.vault_factory.storage import VaultFactoryStorage

async def on_vault_factory_create_vault(
    ctx: HandlerContext,
    create_vault: Transaction[CreateVaultParameter, VaultFactoryStorage],
    vault_origination: Origination[VaultStorage],
) -> None:
    ...