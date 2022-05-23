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
    pass_vote_count        = int(storage_record.passVoteCount)
    pass_vote_mvk          = float(storage_record.passVoteMvkTotal)
    min_vote_pct           = int(storage_record.minProposalRoundVotePercentage)
    min_vote_req           = int(storage_record.minProposalRoundVotesRequired)
    up_vote_count          = int(storage_record.upvoteCount)
    up_vote_mvk            = float(storage_record.upvoteMvkTotal)
    down_vote_count        = int(storage_record.downvoteCount)
    down_vote_mvk          = float(storage_record.downvoteMvkTotal)
    abstain_vote_count     = int(storage_record.abstainCount)
    abstain_vote_mvk       = float(storage_record.abstainMvkTotal)
    min_quorum_pct         = int(storage_record.minQuorumPercentage)
    min_quorum_mvk         = float(storage_record.minQuorumMvkTotal)
    quorum_count           = int(storage_record.quorumCount)
    quorum_mvk             = float(storage_record.quorumMvkTotal)
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
        pass_vote_count                 = pass_vote_count,
        pass_vote_mvk_total             = pass_vote_mvk,
        min_proposal_round_vote_pct     = min_vote_pct,
        min_proposal_round_vote_req     = min_vote_req,
        up_vote_count                   = up_vote_count,
        up_vote_mvk_total               = up_vote_mvk,
        down_vote_count                 = down_vote_count,
        down_vote_mvk_total             = down_vote_mvk,
        abstain_vote_count              = abstain_vote_count,
        abstain_mvk_total               = abstain_vote_mvk,
        min_quorum_percentage           = min_quorum_pct,
        min_quorum_mvk_total            = min_quorum_mvk,
        quorum_vote_count               = quorum_count,
        quorum_mvk_total                = quorum_mvk,
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
    