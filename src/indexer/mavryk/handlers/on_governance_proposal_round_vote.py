
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.governance.storage import GovernanceStorage
from mavryk.types.governance.parameter.proposal_round_vote import ProposalRoundVoteParameter
import mavryk.models as models

async def on_governance_proposal_round_vote(
    ctx: HandlerContext,
    proposal_round_vote: Transaction[ProposalRoundVoteParameter, GovernanceStorage],
) -> None:
    # Get operation values
    governanceAddress       = proposal_round_vote.data.target_address
    proposalsStorage        = proposal_round_vote.storage.proposalLedger
    voteTimestamp           = proposal_round_vote.data.timestamp
    voterAddress            = proposal_round_vote.data.sender_address

    # Create and update records
    for proposalID in proposalsStorage:
        proposal            = await models.GovernanceProposalRecord.get(
            id              = proposalID
        )
        proposal.pass_vote_mvk_total    = float(proposalsStorage[proposalID].passVoteMvkTotal)
        await proposal.save()

        voter, _            = await models.MavrykUser.get_or_create(
            address = voterAddress
        )
        await voter.save()

        satelliteRecord     = await models.SatelliteRecord.get(
            user    = voter
        )
        governance          = await models.Governance.get(
            address = governanceAddress
        )
        snapshotRecord      = await models.GovernanceSatelliteSnapshotRecord.get(
            satellite   = satelliteRecord,
            governance  = governance
        )
        
        voteRecord          = models.GovernanceProposalRecordVote(
            voter                       = voter,
            governance_proposal_record  = proposal
        )
        if proposalID == proposal_round_vote.parameter.__root__:
            voteRecord.timestamp        = voteTimestamp
            voteRecord.voting_power     = snapshotRecord.total_voting_power
            voteRecord.round            = models.GovernanceRoundType.PROPOSAL
            await voteRecord.save()
        else:
            await voteRecord.delete()
    