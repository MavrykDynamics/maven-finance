
from dipdup.context import HandlerContext
from mavryk.types.governance.storage import GovernanceStorage, RoundItem as proposal, RoundItem1 as timelock, RoundItem2 as voting
from dipdup.models import Transaction
from mavryk.types.governance.parameter.start_next_round import StartNextRoundParameter
import mavryk.models as models

async def on_governance_start_next_round(
    ctx: HandlerContext,
    start_next_round: Transaction[StartNextRoundParameter, GovernanceStorage],
) -> None:
    
    # Get operation values
    governance_address                  = start_next_round.data.target_address
    current_round                       = start_next_round.storage.currentCycleInfo.round
    current_blocks_proposal_round       = int(start_next_round.storage.currentCycleInfo.blocksPerProposalRound)
    current_block_voting_round          = int(start_next_round.storage.currentCycleInfo.blocksPerVotingRound)
    current_block_timelock_round        = int(start_next_round.storage.currentCycleInfo.blocksPerTimelockRound)
    current_round_start_level           = int(start_next_round.storage.currentCycleInfo.roundStartLevel)
    current_round_end_level             = int(start_next_round.storage.currentCycleInfo.roundEndLevel)
    current_cycle_end_level             = int(start_next_round.storage.currentCycleInfo.cycleEndLevel)
    current_cycle_voters_rewards        = int(start_next_round.storage.currentCycleInfo.cycleTotalVotersReward)
    current_round_proposals             = start_next_round.storage.currentCycleInfo.roundProposals
    current_round_votes                 = start_next_round.storage.currentCycleInfo.roundVotes
    cycle_counter                       = int(start_next_round.storage.cycleCounter)
    highest_voted_proposal              = int(start_next_round.storage.currentRoundHighestVotedProposalId)
    timelock_proposal                   = int(start_next_round.storage.timelockProposalId)
    satellite_snapshots                 = start_next_round.storage.snapshotLedger

    # Current round
    current_round = models.GovernanceRoundType.PROPOSAL
    if current_round == proposal:
        current_round = models.GovernanceRoundType.PROPOSAL
    elif current_round == timelock:
        current_round = models.GovernanceRoundType.TIMELOCK
    elif current_round == voting:
        current_round = models.GovernanceRoundType.VOTING

    # Update record
    governance  = await models.Governance.get(address   = governance_address)
    governance.current_round                            = current_round
    governance.current_blocks_per_proposal_round        = current_blocks_proposal_round
    governance.current_blocks_per_voting_round          = current_block_voting_round
    governance.current_blocks_per_timelock_round        = current_block_timelock_round
    governance.current_round_start_level                = current_round_start_level
    governance.current_round_end_level                  = current_round_end_level
    governance.current_cycle_end_level                  = current_cycle_end_level
    governance.current_cycle_total_voters_reward        = current_cycle_voters_rewards
    governance.cycle_counter                            = cycle_counter
    governance.current_round_highest_voted_proposal_id  = highest_voted_proposal
    governance.timelock_proposal_id                     = timelock_proposal
    await governance.save()

    # Update round proposals
    round_proposals = await models.GovernanceProposalRecord.filter(current_round_proposal=True).all()
    for proposal_record in round_proposals:
        if not str(proposal_record.id) in current_round_proposals:
            proposal_record.current_round_proposal  = False
            await proposal_record.save()

    # Update round votes
    round_votes = await models.GovernanceProposalRecordVote.filter(current_round_vote=True).all()
    for vote_record in round_votes:
        voter   = await vote_record.voter.first()
        if not voter in current_round_votes:
            vote_record.current_round_vote  = False
            await vote_record.save()

    # Update round satellites snapshot
    for satellite_address in satellite_snapshots:
        user, _                         = await models.MavrykUser.get_or_create(address = satellite_address)
        await user.save()
        storage_satellite_snapshot      = satellite_snapshots[satellite_address]
        satellite_snapshot, _           = await models.GovernanceSatelliteSnapshotRecord.get_or_create(
            governance              = governance,
            user                    = user,
            total_smvk_balance      = float(storage_satellite_snapshot.totalMvkBalance),
            total_delegated_amount  = float(storage_satellite_snapshot.totalDelegatedAmount),
            total_voting_power      = float(storage_satellite_snapshot.totalVotingPower),
            # cycle                   = int(storage_satellite_snapshot.cycle)
        )
        await satellite_snapshot.save()
