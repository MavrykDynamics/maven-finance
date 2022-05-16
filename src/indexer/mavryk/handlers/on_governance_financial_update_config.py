
from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.governance_financial.parameter.update_config import UpdateConfigParameter

async def on_governance_financial_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, GovernanceFinancialStorage],
) -> None:
    ...