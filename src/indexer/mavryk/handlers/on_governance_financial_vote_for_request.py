
from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.governance_financial.parameter.vote_for_request import VoteForRequestParameter

async def on_governance_financial_vote_for_request(
    ctx: HandlerContext,
    vote_for_request: Transaction[VoteForRequestParameter, GovernanceFinancialStorage],
) -> None:
    ...