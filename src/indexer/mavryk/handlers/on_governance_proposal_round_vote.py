
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.governance.storage import GovernanceStorage
from mavryk.types.governance.parameter.proposal_round_vote import ProposalRoundVoteParameter

async def on_governance_proposal_round_vote(
    ctx: HandlerContext,
    proposal_round_vote: Transaction[ProposalRoundVoteParameter, GovernanceStorage],
) -> None:
    # Get operation values
    # breakpoint()
    ...