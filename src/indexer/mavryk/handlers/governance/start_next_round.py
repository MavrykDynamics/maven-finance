from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.types.governance.tezos_storage import GovernanceStorage, RoundItem as proposal, RoundItem1 as timelock, RoundItem2 as voting
from dipdup.models.tezos_tzkt import TzktTransaction
from tortoise.models import Q
from mavryk.types.governance.tezos_parameters.start_next_round import StartNextRoundParameter
import mavryk.models as models

async def start_next_round(
    ctx: HandlerContext,
    start_next_round: TzktTransaction[StartNextRoundParameter, GovernanceStorage],
) -> None:

    try:
        # Get operation values
        timestamp                           = start_next_round.data.timestamp
        governance_address                  = start_next_round.data.target_address
        current_round                       = start_next_round.storage.currentCycleInfo.round
        current_blocks_proposal_round       = int(start_next_round.storage.currentCycleInfo.blocksPerProposalRound)
        current_block_voting_round          = int(start_next_round.storage.currentCycleInfo.blocksPerVotingRound)
        current_block_timelock_round        = int(start_next_round.storage.currentCycleInfo.blocksPerTimelockRound)
        current_round_start_level           = int(start_next_round.storage.currentCycleInfo.roundStartLevel)
        current_round_end_level             = int(start_next_round.storage.currentCycleInfo.roundEndLevel)
        current_cycle_end_level             = int(start_next_round.storage.currentCycleInfo.cycleEndLevel)
        current_cycle_voters_rewards        = int(start_next_round.storage.currentCycleInfo.cycleTotalVotersReward)
        current_cycle_proposals             = start_next_round.storage.cycleProposals
        current_round_votes                 = start_next_round.storage.roundVotes
        cycle_id                            = int(start_next_round.storage.cycleId)
        highest_voted_proposal              = int(start_next_round.storage.cycleHighestVotedProposalId)
        timelock_proposal                   = int(start_next_round.storage.timelockProposalId)
        smvk_snapshots                      = start_next_round.storage.stakedMvkSnapshotLedger
    
        # Current round
        current_round_type = models.GovernanceRoundType.PROPOSAL
        if type(current_round) == proposal:
            current_round_type = models.GovernanceRoundType.PROPOSAL
        elif type(current_round) == timelock:
            current_round_type = models.GovernanceRoundType.TIMELOCK
        elif type(current_round) == voting:
            current_round_type = models.GovernanceRoundType.VOTING
    
        # Update record
        governance  = await models.Governance.get(network=ctx.datasource.network, address= governance_address)
        governance.current_round                            = current_round_type
        governance.current_blocks_per_proposal_round        = current_blocks_proposal_round
        governance.current_blocks_per_voting_round          = current_block_voting_round
        governance.current_blocks_per_timelock_round        = current_block_timelock_round
        governance.current_round_start_level                = current_round_start_level
        governance.current_round_end_level                  = current_round_end_level
        governance.current_cycle_end_level                  = current_cycle_end_level
        governance.current_cycle_total_voters_reward        = current_cycle_voters_rewards
        governance.cycle_id                                 = cycle_id
        governance.cycle_highest_voted_proposal_id          = highest_voted_proposal
        governance.timelock_proposal_id                     = timelock_proposal
        await governance.save()
    
        # Update highest voted proposal
        if start_next_round.storage.cycleHighestVotedProposalId in start_next_round.storage.proposalLedger:
            highest_voted_proposal_storage  = start_next_round.storage.proposalLedger[start_next_round.storage.cycleHighestVotedProposalId]
            await models.GovernanceProposal.filter(
                governance  = governance,
                internal_id = highest_voted_proposal
            ).update(
                reward_claim_ready    = highest_voted_proposal_storage.rewardClaimReady
            )
    
        # Update timelock proposal
        if start_next_round.storage.timelockProposalId in start_next_round.storage.proposalLedger:
            timelock_proposal_storage  = start_next_round.storage.proposalLedger[start_next_round.storage.timelockProposalId]
            await models.GovernanceProposal.filter(
                governance  = governance,
                internal_id = timelock_proposal
            ).update(
                execution_ready            = timelock_proposal_storage.executionReady
            )
    
        # Update round proposals
        round_proposals = await models.GovernanceProposal.filter(current_round_proposal=True).all()
        for proposal_record in round_proposals:
            if not str(proposal_record.internal_id) in current_cycle_proposals:
                proposal_record.current_round_proposal  = False
                await proposal_record.save()
    
        # Update round votes
        round_votes = await models.GovernanceProposalVote.filter(current_round_vote=True).all()
        for vote_record in round_votes:
            voter   = await vote_record.voter
            if not voter in current_round_votes:
                vote_record.current_round_vote  = False
                await vote_record.save()

        # Update SMVK Snapshot ledger
        for cycle in smvk_snapshots:
            smvk_snapshot               = float(smvk_snapshots[cycle])
            governance_smvk_snapshot, _ = await models.GovernanceSMVKSnapshot.get_or_create(
                governance          = governance,
                cycle               = int(cycle),
                smvk_total_supply   = smvk_snapshot
            )
            await governance_smvk_snapshot.save()

        # Defeat all other cycle proposals
        if current_round_type == models.GovernanceRoundType.VOTING:
            await models.GovernanceProposal.filter(
                Q(governance = governance),
                Q(current_round_proposal = True),
                Q(defeated_datetime = None),
                Q(execution_datetime = None),
                Q(dropped_datetime = None),
                Q(executed = False),
                ~Q(internal_id = highest_voted_proposal)
            ).update(
                defeated_datetime       = timestamp
            )
        elif current_round_type == models.GovernanceRoundType.PROPOSAL:
            await models.GovernanceProposal.filter(
                Q(governance = governance),
                Q(defeated_datetime = None),
                Q(dropped_datetime = None),
                Q(execution_ready = False),
                Q(cycle__lt = cycle_id)
            ).update(
                defeated_datetime       = timestamp
            )

    except BaseException as e:
        await save_error_report(e)

