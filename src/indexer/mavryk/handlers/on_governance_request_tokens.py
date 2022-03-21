from mavryk.utils.actions import persist_financial_request
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
from mavryk.types.governance.parameter.request_tokens import RequestTokensParameter
from dipdup.context import HandlerContext

async def on_governance_request_tokens(
    ctx: HandlerContext,
    request_tokens: Transaction[RequestTokensParameter, GovernanceStorage],
) -> None:
    await persist_financial_request(request_tokens)
