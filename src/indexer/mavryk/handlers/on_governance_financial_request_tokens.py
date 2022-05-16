
from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.governance_financial.parameter.request_tokens import RequestTokensParameter

async def on_governance_financial_request_tokens(
    ctx: HandlerContext,
    request_tokens: Transaction[RequestTokensParameter, GovernanceFinancialStorage],
) -> None:
    ...