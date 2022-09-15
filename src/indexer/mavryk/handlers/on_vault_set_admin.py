from mavryk.utils.persisters import persist_admin
from dipdup.models import Transaction
from mavryk.types.vault.parameter.set_admin import SetAdminParameter
from mavryk.types.vault.storage import VaultStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_vault_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, VaultStorage],
) -> None:
    
    # Get operation info
    target_contract = set_admin.data.target_address
    contract        = await models.Vault.get(address = target_contract)

    # Persist new admin
    await persist_admin(set_admin, contract)
