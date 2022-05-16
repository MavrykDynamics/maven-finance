
from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models import Origination

async def on_governance_financial_origination(
    ctx: HandlerContext,
    governance_financial_origination: Origination[GovernanceFinancialStorage],
) -> None:
    ...