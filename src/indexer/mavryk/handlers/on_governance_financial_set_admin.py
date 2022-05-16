
from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from mavryk.types.governance_financial.parameter.set_admin import SetAdminParameter
from dipdup.models import Transaction

async def on_governance_financial_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, GovernanceFinancialStorage],
) -> None:
    ...