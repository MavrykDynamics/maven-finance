
from mavryk.types.governance.parameter.start_proposal_round import StartProposalRoundParameter
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
import mavryk.models as models

async def on_governance_start_proposal_round(
    ctx: HandlerContext,
    start_proposal_round: Transaction[StartProposalRoundParameter, GovernanceStorage],
) -> None:
    # Get operation values
    governanceAddress               = start_proposal_round.data.target_address
    governanceRound                 = start_proposal_round.storage.currentRound
    governanceRoundStartLevel       = int(start_proposal_round.storage.currentRoundStartLevel)
    governanceRoundEndLevel         = int(start_proposal_round.storage.currentRoundEndLevel)
    governanceCycleEndLevel         = int(start_proposal_round.storage.currentCycleEndLevel)
    # governanceRoundProposals        = start_proposal_round.storage.currentRoundProposals
    # governanceRoundVotes            = start_proposal_round.storage.currentRoundVotes
    
    # Current round
    governanceRoundType = models.GovernanceRoundType.NONE
    if governanceRound == "proposal":
        governanceRoundType = models.GovernanceRoundType.PROPOSAL
    elif governanceRound == "timelock":
        governanceRoundType = models.GovernanceRoundType.TIMELOCK
    elif governanceRound == "voting":
        governanceRoundType = models.GovernanceRoundType.VOTING

    # Update records
    governance  = await models.Governance.get(
        address = governanceAddress
    )
    governance.current_round                = governanceRoundType
    governance.current_round_start_level    = governanceRoundStartLevel
    governance.current_round_end_level      = governanceRoundEndLevel
    governance.current_cycle_end_level      = governanceCycleEndLevel
    await governance.save()

    # TODO: Update voters and current proposals records
