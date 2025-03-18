from maven.utils.error_reporting import save_error_report
from maven.types.governance.tezos_storage import GovernanceStorage
from dipdup.models.tezos import TezosTransaction
from maven.types.governance.tezos_parameters.propose import ProposeParameter
from dipdup.context import HandlerContext
from dateutil import parser 
from maven import models as models

async def propose(
    ctx: HandlerContext,
    propose: TezosTransaction[ProposeParameter, GovernanceStorage],
) -> None:

    try:
        # Get operation values
        governance              = await models.Governance.get(
            network = 'atlasnet'
        )
        next_proposal_id        = int(propose.storage.nextProposalId)
        current_id              = str(next_proposal_id - 1)
        storage_record          = propose.storage.proposalLedger[current_id]
        proposer_address        = storage_record.proposerAddress
        execution_counter       = int(storage_record.proposalDataExecutionCounter)
        status                  = models.GovernanceActionStatus.ACTIVE
        if storage_record.status == 'DROPPED':
            status  = models.GovernanceActionStatus.DROPPED
        title                   = storage_record.title
        description             = storage_record.description
        invoice                 = storage_record.invoice
        code                    = storage_record.sourceCode
        success_reward          = float(storage_record.successReward)
        total_voters_reward     = float(storage_record.totalVotersReward)
        executed                = storage_record.executed
        locked                  = storage_record.locked
        payment_processed       = storage_record.paymentProcessed
        reward_claim_ready      = storage_record.rewardClaimReady
        proposal_vote_count     = int(storage_record.proposalVoteCount)
        proposal_vote_smvn      = float(storage_record.proposalVoteStakedMvnTotal)
        min_vote_pct            = int(storage_record.minProposalRoundVotePercentage)
        min_vote_req            = int(storage_record.minProposalRoundVotesRequired)
        yay_vote_count          = int(storage_record.yayVoteCount)
        yay_vote_smvn           = float(storage_record.yayVoteStakedMvnTotal)
        nay_vote_count          = int(storage_record.nayVoteCount)
        nay_vote_smvn           = float(storage_record.nayVoteStakedMvnTotal)
        pass_vote_count         = int(storage_record.passVoteCount)
        pass_vote_smvn          = float(storage_record.passVoteStakedMvnTotal)
        min_quorum_pct          = int(storage_record.minQuorumPercentage)
        min_yay_vote_percentage = float(storage_record.minYayVotePercentage)
        quorum_count            = int(storage_record.quorumCount)
        quorum_smvn             = float(storage_record.quorumStakedMvnTotal)
        start_datetime          = parser.parse(storage_record.startDateTime)
        execution_datetime      = None
        cycle                   = int(storage_record.cycle)
        current_cycle_start     = int(storage_record.currentCycleStartLevel)
        current_cycle_end       = int(storage_record.currentCycleEndLevel)
        satellite_snapshots     = propose.storage.snapshotLedger
    
        # Proposal record
        user                    = await models.maven_user_cache.get(network='atlasnet', address=proposer_address)
    
        proposalRecord              = models.GovernanceProposal(
            internal_id                     = int(current_id),
            governance                      = governance,
            proposer                        = user,
            status                          = status,
            execution_counter               = execution_counter,
            title                           = title,
            description                     = description,
            invoice                         = invoice,
            source_code                     = code,
            executed                        = executed,
            locked                          = locked,
            payment_processed               = payment_processed,
            reward_claim_ready              = reward_claim_ready,
            success_reward                  = success_reward,
            total_voters_reward             = total_voters_reward,
            proposal_vote_count             = proposal_vote_count,
            proposal_vote_smvn_total        = proposal_vote_smvn,
            min_proposal_round_vote_pct     = min_vote_pct,
            min_proposal_round_vote_req     = min_vote_req,
            yay_vote_count                  = yay_vote_count,
            yay_vote_smvn_total             = yay_vote_smvn,
            nay_vote_count                  = nay_vote_count,
            nay_vote_smvn_total             = nay_vote_smvn,
            pass_vote_count                 = pass_vote_count,
            pass_vote_smvn_total            = pass_vote_smvn,
            min_quorum_percentage           = min_quorum_pct,
            min_yay_vote_percentage         = min_yay_vote_percentage,
            quorum_vote_count               = quorum_count,
            quorum_smvn_total               = quorum_smvn,
            start_datetime                  = start_datetime,
            execution_datetime              = execution_datetime,
            cycle                           = cycle,
            current_cycle_start_level       = current_cycle_start,
            current_cycle_end_level         = current_cycle_end,
            current_round_proposal          = True
        )
        await proposalRecord.save()
    
        # Governance record
        governance.next_proposal_id = governance.next_proposal_id + 1
        await governance.save()
    
        # Update or a satellite snapshot record
        if proposer_address in satellite_snapshots:
            satellite_snapshot      = satellite_snapshots[proposer_address]
            governance_snapshot, _  = await models.GovernanceSatelliteSnapshot.get_or_create(
                governance              = governance,
                user                    = user
            )
            governance_snapshot.cycle                   = cycle
            governance_snapshot.ready                   = satellite_snapshot.ready
            governance_snapshot.total_smvn_balance      = float(satellite_snapshot.totalStakedMvnBalance)
            governance_snapshot.total_delegated_amount  = float(satellite_snapshot.totalDelegatedAmount)
            governance_snapshot.total_voting_power      = float(satellite_snapshot.totalVotingPower)
            await governance_snapshot.save()

        # Increment satellite counter
        await ctx.execute_sql('update_governance_proposal_counter')

    except BaseException as e:
        await save_error_report(e)

