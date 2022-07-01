
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
from mavryk.types.governance.parameter.voting_round_vote import VotingRoundVoteParameter, VoteItem as pass_, VoteItem1 as nay, VoteItem2 as yay
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_governance_voting_round_vote(
    ctx: HandlerContext,
    voting_round_vote: Transaction[VotingRoundVoteParameter, GovernanceStorage],
) -> None:

    # Get operation values
    governance_address          = voting_round_vote.data.target_address
    proposal_id                 = int(voting_round_vote.storage.cycleHighestVotedProposalId )
    storage_proposal            = voting_round_vote.storage.proposalLedger[voting_round_vote.storage.cycleHighestVotedProposalId ]
    voter_address               = voting_round_vote.data.sender_address
    current_round               = models.GovernanceRoundType.VOTING
    vote_type                   = voting_round_vote.parameter.vote
    storage_voter               = storage_proposal.proposalVotersMap[voter_address]
    voting_power                = float(storage_voter.nat)
    proposal_vote_count         = int(storage_proposal.passVoteCount)
    proposal_vote_smvk_total    = float(storage_proposal.passVoteStakedMvkTotal)
    yay_vote_count              = int(storage_proposal.yayVoteCount)
    yay_vote_smvk_total         = float(storage_proposal.yayVoteStakedMvkTotal)
    nay_vote_count              = int(storage_proposal.nayVoteCount)
    nay_vote_smvk_total         = float(storage_proposal.nayVoteStakedMvkTotal)
    pass_vote_count             = int(storage_proposal.passVoteCount)
    pass_vote_smvk_total        = float(storage_proposal.passVoteStakedMvkTotal)
    quorum_count                = float(storage_proposal.quorumCount)
    quorum_smvk_total           = float(storage_proposal.quorumStakedMvkTotal)

    # Get vote
    vote        = models.GovernanceVoteType.YAY
    if type(vote_type) == pass_:
        vote    = models.GovernanceVoteType.PASS
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
    proposal.proposal_vote_count            = proposal_vote_count
    proposal.proposal_vote_smvk_total       = proposal_vote_smvk_total
    proposal.yay_vote_count                 = yay_vote_count
    proposal.yay_vote_smvk_total            = yay_vote_smvk_total
    proposal.nay_vote_count                 = nay_vote_count
    proposal.nay_vote_smvk_total            = nay_vote_smvk_total
    proposal.pass_vote_count                = pass_vote_count
    proposal.pass_vote_smvk_total           = pass_vote_smvk_total
    proposal.quorum_count                   = quorum_count
    proposal.quorum_smvk_total              = quorum_smvk_total
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
