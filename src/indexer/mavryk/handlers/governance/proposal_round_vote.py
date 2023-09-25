from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.governance.tezos_storage import GovernanceStorage
from mavryk.types.governance.tezos_parameters.proposal_round_vote import ProposalRoundVoteParameter
import mavryk.models as models

async def proposal_round_vote(
    ctx: HandlerContext,
    proposal_round_vote: TzktTransaction[ProposalRoundVoteParameter, GovernanceStorage],
) -> None:

    try:
        # Get operation values
        governance_address      = proposal_round_vote.data.target_address
        proposal_id             = int(proposal_round_vote.parameter.__root__)
        storage_proposal        = proposal_round_vote.storage.proposalLedger[proposal_round_vote.parameter.__root__]
        voter_address           = proposal_round_vote.data.sender_address
        current_round           = models.GovernanceRoundType.PROPOSAL
        vote                    = models.GovernanceVoteType.YAY
        vote_count              = int(storage_proposal.proposalVoteCount)
        vote_smvk_total         = float(storage_proposal.proposalVoteStakedMvkTotal)
        satellite_snapshots     = proposal_round_vote.storage.snapshotLedger
        timestamp               = proposal_round_vote.data.timestamp
    
        # Create and update records
        governance  = await models.Governance.get(network=ctx.datasource.name.replace('tzkt_',''), address= governance_address)
        voter       = await models.mavryk_user_cache.get(network=ctx.datasource.name.replace('tzkt_',''), address=voter_address)
    
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
        proposal            = await models.GovernanceProposal.get(
            internal_id = proposal_id,
            governance  = governance
        )
        proposal.proposal_vote_count        = vote_count
        proposal.proposal_vote_smvk_total   = vote_smvk_total
        await proposal.save()
    
        # Check if user already voted and delete the vote
        proposal_vote = await models.GovernanceProposalVote.get_or_none(
            round                       = current_round,
            voter                       = voter,
            current_round_vote          = True
        )

        if proposal_vote:
            # Get past voted proposal and remove vote from it
            past_proposal_record    = await proposal_vote.governance_proposal
            storage_past_proposal   = proposal_round_vote.storage.proposalLedger[str(past_proposal_record.internal_id)]
            past_vote_count         = int(storage_past_proposal.proposalVoteCount)
            past_vote_smvk_total    = float(storage_past_proposal.proposalVoteStakedMvkTotal)
            await models.GovernanceProposal.filter(
                internal_id = past_proposal_record.internal_id,
                governance  = governance
            ).update(
                proposal_vote_count       = past_vote_count,
                proposal_vote_smvk_total  = past_vote_smvk_total
            )
            await proposal_vote.delete()
        
        # Create a new vote
        proposal_vote, _    = await models.GovernanceProposalVote.get_or_create(
            governance_proposal         = proposal,
            voter                       = voter,
            round                       = current_round
        )
        proposal_vote.vote                  = vote
        proposal_vote.voting_power          = governance_snapshot.total_voting_power
        proposal_vote.current_round_vote    = True
        proposal_vote.timestamp             = timestamp
        await proposal_vote.save()

    except BaseException as e:
        await save_error_report(e)

