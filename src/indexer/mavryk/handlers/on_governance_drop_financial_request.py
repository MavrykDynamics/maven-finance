
from dipdup.context import HandlerContext
from mavryk.types.governance.storage import GovernanceStorage
from mavryk.types.governance.parameter.drop_financial_request import DropFinancialRequestParameter
from dipdup.models import Transaction

async def on_governance_drop_financial_request(
    ctx: HandlerContext,
    drop_financial_request: Transaction[DropFinancialRequestParameter, GovernanceStorage],
) -> None:
    ...