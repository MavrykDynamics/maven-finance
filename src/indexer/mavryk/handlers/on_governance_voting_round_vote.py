
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
from mavryk.types.governance.parameter.voting_round_vote import VotingRoundVoteParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_governance_voting_round_vote(
    ctx: HandlerContext,
    voting_round_vote: Transaction[VotingRoundVoteParameter, GovernanceStorage],
) -> None:
    # Get operation values
    governanceAddress       = voting_round_vote.data.target_address
    voterAddress            = voting_round_vote.data.sender_address
    voteTimestamp           = voting_round_vote.data.timestamp
    proposalID              = int(voting_round_vote.parameter.nat_0)
    proposalVote            = int(voting_round_vote.parameter.nat_1)
    proposalStorage         = voting_round_vote.storage.proposalLedger[voting_round_vote.parameter.nat_0]
    upvoteMVKTotal          = float(proposalStorage.upvoteMvkTotal)
    downvoteMVKTotal        = float(proposalStorage.downvoteMvkTotal)
    abstainMVKTotal         = float(proposalStorage.abstainMvkTotal)
    quorumMVKTotal          = float(proposalStorage.quorumMvkTotal)

    # Update records
    proposal    = await models.GovernanceProposalRecord.get(
        id  = proposalID
    )
    proposal.up_vote_mvk_total      = upvoteMVKTotal
    proposal.down_vote_mvk_total    = downvoteMVKTotal
    proposal.abstain_mvk_total      = abstainMVKTotal
    proposal.quorum_mvk_total       = quorumMVKTotal
    await proposal.save()

    # Create vote
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
        timestamp                   = voteTimestamp,
        voter                       = voter,
        governance_proposal_record  = proposal,
        voting_power                = snapshotRecord.total_voting_power,
        round                       = models.GovernanceRoundType.VOTING,
        vote                        = proposalVote
    )
    await voteRecord.save()
