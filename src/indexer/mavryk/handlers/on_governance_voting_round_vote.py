
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
from mavryk.types.governance.parameter.voting_round_vote import VotingRoundVoteParameter, VoteItem as abstain, VoteItem1 as nay, VoteItem2 as yay
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_governance_voting_round_vote(
    ctx: HandlerContext,
    voting_round_vote: Transaction[VotingRoundVoteParameter, GovernanceStorage],
) -> None:

    # Get operation values
    governance_address      = voting_round_vote.data.target_address
    proposal_id             = int(voting_round_vote.storage.cycleHighestVotedProposalId )
    storage_proposal        = voting_round_vote.storage.proposalLedger[voting_round_vote.storage.cycleHighestVotedProposalId ]
    voter_address           = voting_round_vote.data.sender_address
    current_round           = models.GovernanceRoundType.VOTING
    vote_type               = voting_round_vote.parameter.vote
    storage_voter           = storage_proposal.passVotersMap[voter_address]
    voting_power            = float(storage_voter.nat)
    pass_vote_count         = int(storage_proposal.passVoteCount)
    pass_vote_mvk_total     = float(storage_proposal.passVoteMvkTotal)
    up_vote_count           = int(storage_proposal.upvoteCount)
    up_vote_mvk_total       = float(storage_proposal.upvoteMvkTotal)
    down_vote_count         = int(storage_proposal.downvoteCount)
    down_vote_mvk_total     = float(storage_proposal.downvoteMvkTotal)
    abstain_vote_count      = int(storage_proposal.abstainCount)
    abstain_vote_mvk_total  = float(storage_proposal.abstainMvkTotal)
    quorum_count            = float(storage_proposal.quorumCount)
    quorum_mvk_total        = float(storage_proposal.quorumMvkTotal)

    # Get vote
    vote        = models.GovernanceVoteType.YAY
    if type(vote_type) == abstain:
        vote    = models.GovernanceVoteType.ABSTAIN
    elif type(vote_type) == nay:
        vote    = models.GovernanceVoteType.NAY

    # Create and update records
    governance  = await models.Governance.get(address   = governance_address)
    voter, _    = await models.MavrykUser.get_or_create(address = voter_address)
    await voter.save()

    # Update proposal with vote
    proposal    = await models.GovernanceProposalRecord.get(
        id          = proposal_id,
        governance  = governance
    )
    proposal.pass_vote_count        = pass_vote_count
    proposal.pass_vote_mvk_total    = pass_vote_mvk_total
    proposal.up_vote_count          = up_vote_count
    proposal.up_vote_mvk_total      = up_vote_mvk_total
    proposal.down_vote_count        = down_vote_count
    proposal.down_vote_mvk_total    = down_vote_mvk_total
    proposal.abstain_vote_count     = abstain_vote_count
    proposal.abstain_vote_mvk_total = abstain_vote_mvk_total
    proposal.quorum_count           = quorum_count
    proposal.quorum_mvk_total       = quorum_mvk_total
    await proposal.save()
    
    # Create a new vote
    proposal_vote = models.GovernanceProposalRecordVote(
        governance_proposal_record  = proposal,
        voter                       = voter,
        round                       = current_round,
        vote                        = vote,
        voting_power                = voting_power,
        current_round_vote          = True
    )
    await proposal_vote.save()
