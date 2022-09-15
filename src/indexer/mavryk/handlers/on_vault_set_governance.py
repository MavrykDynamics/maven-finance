from mavryk.utils.persisters import persist_governance
from dipdup.models import Transaction
from mavryk.types.vault.storage import VaultStorage
from dipdup.context import HandlerContext
from mavryk.types.vault.parameter.set_governance import SetGovernanceParameter
import mavryk.models as models

async def on_vault_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, VaultStorage],
) -> None:
    
    # Get operation info
    target_contract = set_governance.data.target_address
    contract        = await models.Vault.get(address = target_contract)

    # Persist new admin
    await persist_governance(set_governance, contract)
