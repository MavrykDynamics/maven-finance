
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
    vote_count              = int(storage_proposal.passVoteCount)
    vote_mvk_total          = float(storage_proposal.passVoteMvkTotal)

    # Get vote
    vote        = models.GovernanceVoteType.YAY
    if vote_type == abstain:
        vote    = models.GovernanceVoteType.ABSTAIN
    elif vote_type == nay:
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
    proposal.pass_vote_count    = vote_count
    proposal.vote_mvk_total     = vote_mvk_total
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
