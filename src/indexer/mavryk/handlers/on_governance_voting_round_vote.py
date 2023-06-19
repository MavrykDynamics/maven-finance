from mavryk.utils.error_reporting import save_error_report

from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
from mavryk.types.governance.parameter.voting_round_vote import VotingRoundVoteParameter, VoteItem as pass_, VoteItem1 as nay, VoteItem2 as yay
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_governance_voting_round_vote(
    ctx: HandlerContext,
    voting_round_vote: Transaction[VotingRoundVoteParameter, GovernanceStorage],
) -> None:

    try:
        # Get operation values
        governance_address          = voting_round_vote.data.target_address
        proposal_id                 = int(voting_round_vote.storage.cycleHighestVotedProposalId )
        storage_proposal            = voting_round_vote.storage.proposalLedger[voting_round_vote.storage.cycleHighestVotedProposalId ]
        voter_address               = voting_round_vote.data.sender_address
        current_round               = models.GovernanceRoundType.VOTING
        vote_type                   = voting_round_vote.parameter.vote
        yay_vote_count              = int(storage_proposal.yayVoteCount)
        yay_vote_smvk_total         = float(storage_proposal.yayVoteStakedMvkTotal)
        nay_vote_count              = int(storage_proposal.nayVoteCount)
        nay_vote_smvk_total         = float(storage_proposal.nayVoteStakedMvkTotal)
        pass_vote_count             = int(storage_proposal.passVoteCount)
        pass_vote_smvk_total        = float(storage_proposal.passVoteStakedMvkTotal)
        quorum_count                = float(storage_proposal.quorumCount)
        quorum_smvk_total           = float(storage_proposal.quorumStakedMvkTotal)
        satellite_snapshots         = voting_round_vote.storage.snapshotLedger
        timestamp                   = voting_round_vote.data.timestamp
    
        # Get vote
        vote        = models.GovernanceVoteType.YAY
        if type(vote_type) == pass_:
            vote    = models.GovernanceVoteType.PASS
        elif type(vote_type) == nay:
            vote    = models.GovernanceVoteType.NAY
    
        # Create and update records
        governance  = await models.Governance.get(network=ctx.datasource.network, address= governance_address)
        voter       = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=voter_address)
    
        # Update or a satellite snapshot record
        governance_snapshot = await models.GovernanceSatelliteSnapshot.get_or_none(
            governance  = governance,
            user        = voter,
            cycle       = governance.cycle_id
        )
        if voter_address in satellite_snapshots:
            satellite_snapshot      = satellite_snapshots[voter_address]
            governance_snapshot, _  = await models.GovernanceSatelliteSnapshot.get_or_create(
                governance              = governance,
                user                    = voter
            )
            governance_snapshot.cycle                   = governance.cycle_id
            governance_snapshot.ready                   = satellite_snapshot.ready
            governance_snapshot.total_smvk_balance      = float(satellite_snapshot.totalStakedMvkBalance)
            governance_snapshot.total_delegated_amount  = float(satellite_snapshot.totalDelegatedAmount)
            governance_snapshot.total_voting_power      = float(satellite_snapshot.totalVotingPower)
            await governance_snapshot.save()
    
        # Update proposal with vote
        proposal        = await models.GovernanceProposal.get(
            internal_id = proposal_id,
            governance  = governance
        )
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
        proposal_vote, _    = await models.GovernanceProposalVote.get_or_create(
            governance_proposal         = proposal,
            voter                       = voter,
            round                       = current_round
        )
        proposal_vote.vote                      = vote
        proposal_vote.voting_power              = governance_snapshot.total_voting_power
        proposal_vote.timestamp                 = timestamp
        proposal_vote.current_round_vote        = True
        await proposal_vote.save()

    except BaseException as e:
         await save_error_report(e)

