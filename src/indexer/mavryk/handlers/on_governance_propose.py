from mavryk.utils.error_reporting import save_error_report
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
from mavryk.types.governance.parameter.propose import ProposeParameter
from dipdup.context import HandlerContext
from dateutil import parser 
import mavryk.models as models

async def on_governance_propose(
    ctx: HandlerContext,
    propose: Transaction[ProposeParameter, GovernanceStorage],
) -> None:

    try:
        # Get operation values
        governance_address      = propose.data.target_address
        governance              = await models.Governance.get(
            address = governance_address
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
        proposal_vote_smvk      = float(storage_record.proposalVoteStakedMvkTotal)
        min_vote_pct            = int(storage_record.minProposalRoundVotePercentage)
        min_vote_req            = int(storage_record.minProposalRoundVotesRequired)
        yay_vote_count          = int(storage_record.yayVoteCount)
        yay_vote_smvk           = float(storage_record.yayVoteStakedMvkTotal)
        nay_vote_count          = int(storage_record.nayVoteCount)
        nay_vote_smvk           = float(storage_record.nayVoteStakedMvkTotal)
        pass_vote_count         = int(storage_record.passVoteCount)
        pass_vote_smvk          = float(storage_record.passVoteStakedMvkTotal)
        min_quorum_pct          = int(storage_record.minQuorumPercentage)
        min_yay_vote_percentage = float(storage_record.minYayVotePercentage)
        quorum_count            = int(storage_record.quorumCount)
        quorum_smvk             = float(storage_record.quorumStakedMvkTotal)
        start_datetime          = parser.parse(storage_record.startDateTime)
        cycle                   = int(storage_record.cycle)
        current_cycle_start     = int(storage_record.currentCycleStartLevel)
        current_cycle_end       = int(storage_record.currentCycleEndLevel)
        satellite_snapshots     = propose.storage.snapshotLedger
    
        # Proposal record
        user                    = await models.mavryk_user_cache.get(address=proposer_address)
    
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
            proposal_vote_smvk_total        = proposal_vote_smvk,
            min_proposal_round_vote_pct     = min_vote_pct,
            min_proposal_round_vote_req     = min_vote_req,
            yay_vote_count                  = yay_vote_count,
            yay_vote_smvk_total             = yay_vote_smvk,
            nay_vote_count                  = nay_vote_count,
            nay_vote_smvk_total             = nay_vote_smvk,
            pass_vote_count                 = pass_vote_count,
            pass_vote_smvk_total            = pass_vote_smvk,
            min_quorum_percentage           = min_quorum_pct,
            min_yay_vote_percentage         = min_yay_vote_percentage,
            quorum_vote_count               = quorum_count,
            quorum_smvk_total               = quorum_smvk,
            start_datetime                  = start_datetime,
            cycle                           = cycle,
            current_cycle_start_level       = current_cycle_start,
            current_cycle_end_level         = current_cycle_end,
            current_round_proposal          = True,
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
            governance_snapshot.total_smvk_balance      = float(satellite_snapshot.totalStakedMvkBalance)
            governance_snapshot.total_delegated_amount  = float(satellite_snapshot.totalDelegatedAmount)
            governance_snapshot.total_voting_power      = float(satellite_snapshot.totalVotingPower)
            await governance_snapshot.save()
        
    except BaseException as e:
         await save_error_report(e)

