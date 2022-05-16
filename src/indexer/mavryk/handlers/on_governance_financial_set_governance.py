
from mavryk.types.governance_financial.parameter.set_governance import SetGovernanceParameter
from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction

async def on_governance_financial_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, GovernanceFinancialStorage],
) -> None:
    ...