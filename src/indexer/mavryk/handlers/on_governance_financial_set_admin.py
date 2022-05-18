
from mavryk.utils.persisters import persist_admin
from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from mavryk.types.governance_financial.parameter.set_admin import SetAdminParameter
from dipdup.models import Transaction
import mavryk.models as models

async def on_governance_financial_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, GovernanceFinancialStorage],
) -> None:
    
    # Get operation info
    target_contract = set_admin.data.target_address
    contract        = await models.GovernanceFinancial.get(address = target_contract)

    # Persist new admin
    await persist_admin(set_admin, contract)