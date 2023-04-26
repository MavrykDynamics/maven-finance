from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_governance
from mavryk.types.governance_financial.parameter.set_governance import SetGovernanceParameter
from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
import mavryk.models as models

async def on_governance_financial_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, GovernanceFinancialStorage],
) -> None:

    try:    
        # Get operation info
        target_contract = set_governance.data.target_address
        contract        = await models.GovernanceFinancial.get(address = target_contract)
    
        # Persist new admin
        await persist_governance(set_governance, contract)

    except BaseException:
         await save_error_report()

