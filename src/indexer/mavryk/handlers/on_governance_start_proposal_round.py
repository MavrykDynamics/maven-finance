
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

    # Reset current round votes & proposals
    currentRoundVotes   = await models.GovernanceProposalRecordVote.filter(current_round_vote=True).all()
    for currentRoundVote in currentRoundVotes:
        currentRoundVote.current_round_vote = False
        await currentRoundVote.save()

    currentRoundProposals   = await models.GovernanceProposalRecord.filter(current_round_proposal=True).all()
    for currentRoundProposal in currentRoundProposals:
        currentRoundProposal.current_round_proposal = False
        await currentRoundProposal.save()
