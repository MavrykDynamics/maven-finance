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

    # Get operation values
    governance_address              = propose.data.target_address
    governance                      = await models.Governance.get(
        address = governance_address
    )
    current_id             = str(int(governance.next_proposal_id))
    storage_record         = propose.storage.proposalLedger[current_id]
    proposer_address       = storage_record.proposerAddress
    execution_counter      = int(storage_record.proposalMetadataExecutionCounter)
    status                 = models.GovernanceRecordStatus.ACTIVE
    if storage_record.status == 'DROPPED':
        status             = models.GovernanceRecordStatus.DROPPED
    title                  = storage_record.title
    description            = storage_record.description
    invoice                = storage_record.invoice
    code                   = storage_record.sourceCode
    success_reward         = float(storage_record.successReward)
    executed               = storage_record.executed
    locked                 = storage_record.locked
    payment_processed      = storage_record.paymentProcessed
    proposal_vote_count    = int(storage_record.proposalVoteCount)
    proposal_vote_smvk     = float(storage_record.proposalVoteStakedMvkTotal)
    min_vote_pct           = int(storage_record.minProposalRoundVotePercentage)
    min_vote_req           = int(storage_record.minProposalRoundVotesRequired)
    yay_vote_count         = int(storage_record.yayVoteCount)
    yay_vote_smvk          = float(storage_record.yayVoteStakedMvkTotal)
    nay_vote_count         = int(storage_record.nayVoteCount)
    nay_vote_smvk          = float(storage_record.nayVoteStakedMvkTotal)
    pass_vote_count        = int(storage_record.passVoteCount)
    pass_vote_smvk         = float(storage_record.passVoteStakedMvkTotal)
    min_quorum_pct         = int(storage_record.minQuorumPercentage)
    min_yay_vote_percentage= float(storage_record.minYayVotePercentage)
    quorum_count           = int(storage_record.quorumCount)
    quorum_smvk            = float(storage_record.quorumStakedMvkTotal)
    start_datetime         = parser.parse(storage_record.startDateTime)
    cycle                  = int(storage_record.cycle)
    current_cycle_start    = int(storage_record.currentCycleStartLevel)
    current_cycle_end      = int(storage_record.currentCycleEndLevel)

    # Proposal record
    user, _ = await models.MavrykUser.get_or_create(
        address = proposer_address
    )
    await user.save()

    proposalRecord              = models.GovernanceProposalRecord(
        id                              = int(governance.next_proposal_id),
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
        success_reward                  = success_reward,
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
    