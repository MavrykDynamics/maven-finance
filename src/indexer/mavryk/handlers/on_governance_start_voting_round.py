
from dipdup.context import HandlerContext
from mavryk.types.governance.parameter.start_voting_round import StartVotingRoundParameter
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_governance_start_voting_round(
    ctx: HandlerContext,
    start_voting_round: Transaction[StartVotingRoundParameter, GovernanceStorage],
) -> None:
    # Get operation values
    governanceAddress                       = start_voting_round.data.target_address
    governanceCurrentRound                  = start_voting_round.storage.currentRound
    governanceCurrentRoundStartLevel        = int(start_voting_round.storage.currentRoundStartLevel)
    governanceCurrentRoundEndLevel          = int(start_voting_round.storage.currentRoundEndLevel)
    governanceProposalVoteID                = int(start_voting_round.storage.currentRoundHighestVotedProposalId)

    # Current round
    governanceRoundType = models.GovernanceRoundType.NONE
    if governanceCurrentRound == "proposal":
        governanceRoundType = models.GovernanceRoundType.PROPOSAL
    elif governanceCurrentRound == "timelock":
        governanceRoundType = models.GovernanceRoundType.TIMELOCK
    elif governanceCurrentRound == "voting":
        governanceRoundType = models.GovernanceRoundType.VOTING

    # Update record
    governance  = await models.Governance.get(
        address = governanceAddress
    )
    governance.current_round                = governanceRoundType
    governance.current_round_start_level    = governanceCurrentRoundStartLevel
    governance.current_round_end_level      = governanceCurrentRoundEndLevel
    await governance.save()

    proposalRecord  = await models.GovernanceProposalRecord.get(
        id  = governanceProposalVoteID
    )
    proposalRecord.round_highest_voted_proposal = True
    await proposalRecord.save()

    # Reset current round votes
    currentRoundVotes   = await models.GovernanceProposalRecordVote.filter(current_round_vote=True).all()
    for currentRoundVote in currentRoundVotes:
        currentRoundVote.current_round_vote = False
        await currentRoundVote.save()
