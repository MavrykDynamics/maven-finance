from mavryk.utils.actions import persist_financial_request
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
from mavryk.types.governance.parameter.request_mint import RequestMintParameter
from dipdup.context import HandlerContext

async def on_governance_request_mint(
    ctx: HandlerContext,
    request_mint: Transaction[RequestMintParameter, GovernanceStorage],
) -> None:
    await persist_financial_request(request_mint)