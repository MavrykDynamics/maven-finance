
from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.governance_financial.parameter.drop_financial_request import DropFinancialRequestParameter

async def on_governance_financial_drop_financial_request(
    ctx: HandlerContext,
    drop_financial_request: Transaction[DropFinancialRequestParameter, GovernanceFinancialStorage],
) -> None:
    ...