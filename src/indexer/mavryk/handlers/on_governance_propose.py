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
    governanceAddress           = propose.data.target_address
    governance                  = await models.Governance.get(
        address = governanceAddress
    )
    proposalCurrentID           = str(governance.next_proposal_id)
    proposalStorage             = propose.storage.proposalLedger[proposalCurrentID]
    proposerAddress             = proposalStorage.proposerAddress
    proposalMetadata            = proposalStorage.proposalMetadata
    proposalStatus              = models.GovernanceRecordStatus.ACTIVE
    if proposalStorage.status == 'DROPPED':
        proposalStatus          = models.GovernanceRecordStatus.DROPPED
    proposalTitle               = proposalStorage.title
    proposalDescription         = proposalStorage.description
    proposalInvoice             = proposalStorage.invoice
    proposalCode                = proposalStorage.sourceCode
    proposalRewards             = float(proposalStorage.successReward)
    proposalExecuted            = proposalStorage.executed
    proposalLocked              = proposalStorage.locked
    proposalPassVoteCount       = int(proposalStorage.passVoteCount)
    proposalPassVoteMVK         = float(proposalStorage.passVoteMvkTotal)
    proposalMinVotePct          = int(proposalStorage.minProposalRoundVotePercentage)
    proposalMinVoteReq          = int(proposalStorage.minProposalRoundVotesRequired)
    proposalUpVoteCount         = int(proposalStorage.upvoteCount)
    proposalUpVoteMVK           = float(proposalStorage.upvoteMvkTotal)
    proposalDownVoteCount       = int(proposalStorage.downvoteCount)
    proposalDownVoteMVK         = float(proposalStorage.downvoteMvkTotal)
    proposalAbstainVoteCount    = int(proposalStorage.abstainCount)
    proposalAbstainVoteMVK      = float(proposalStorage.abstainMvkTotal)
    proposalMinQuorumPct        = int(proposalStorage.minQuorumPercentage)
    proposalMinQuorumMVK        = float(proposalStorage.minQuorumMvkTotal)
    proposalQuorumCount         = int(proposalStorage.quorumCount)
    proposalQuorumMVK           = float(proposalStorage.quorumMvkTotal)
    proposalStartDatetime       = parser.parse(proposalStorage.startDateTime)
    proposalCycle               = int(proposalStorage.cycle)
    proposalCurrentCycleStart   = int(proposalStorage.currentCycleStartLevel)
    proposalCurrentCycleEnd     = int(proposalStorage.currentCycleEndLevel)
    governanceNextProposalID    = int(propose.storage.nextProposalId)

    # Proposal record
    proposer, _ = await models.MavrykUser.get_or_create(
        address = proposerAddress
    )
    await proposer.save()

    proposalRecord              = models.GovernanceProposalRecord(
        id                              = governance.next_proposal_id,
        proposer                        = proposer,
        status                          = proposalStatus,
        title                           = proposalTitle,
        description                     = proposalDescription,
        invoice                         = proposalInvoice,
        source_code                     = proposalCode,
        executed                        = proposalExecuted,
        locked                          = proposalLocked,
        success_reward                  = proposalRewards,
        pass_vote_count                 = proposalPassVoteCount,
        pass_vote_mvk_total             = proposalPassVoteMVK,
        min_proposal_round_vote_pct     = proposalMinVotePct,
        min_proposal_round_vote_req     = proposalMinVoteReq,
        up_vote_count                   = proposalUpVoteCount,
        up_vote_mvk_total               = proposalUpVoteMVK,
        down_vote_count                 = proposalDownVoteCount,
        down_vote_mvk_total             = proposalDownVoteMVK,
        abstain_count                   = proposalAbstainVoteCount,
        abstain_mvk_total               = proposalAbstainVoteMVK,
        min_quorum_percentage           = proposalMinQuorumPct,
        min_quorum_mvk_total            = proposalMinQuorumMVK,
        quorum_count                    = proposalQuorumCount,
        quorum_mvk_total                = proposalQuorumMVK,
        start_datetime                  = proposalStartDatetime,
        cycle                           = proposalCycle,
        current_cycle_start_level       = proposalCurrentCycleStart,
        current_cycle_end_level         = proposalCurrentCycleEnd,
        current_round_proposal          = True
    )
    await proposalRecord.save()

    # Governance record
    governance.next_proposal_id = governanceNextProposalID
    await governance.save()

    # Proposal metadata
    for metadata in proposalMetadata:
        metadataRecord    = models.GovernanceProposalRecordMetadata(
            governance_proposal_record  = proposalRecord,
            name                        = metadata,
            metadata                    = proposalMetadata[metadata]
        )
        await metadataRecord.save()
    