
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.context import HandlerContext
from dipdup.models import Origination
import mavryk.models as models

async def on_governance_origination(
    ctx: HandlerContext,
    governance_origination: Origination[GovernanceStorage],
) -> None:
    # Get operation values
    governanceAddress                               = governance_origination.data.originated_contract_address
    governanceSuccessReward                         = int(governance_origination.storage.config.successReward)
    governanceMinQuorumPercentage                   = int(governance_origination.storage.config.minQuorumPercentage)
    governanceMinQuorumMvkTotal                     = int(governance_origination.storage.config.minQuorumMvkTotal)
    governanceVotingPowerRatio                      = int(governance_origination.storage.config.votingPowerRatio)
    governanceProposalSubmissionFee                 = int(governance_origination.storage.config.proposalSubmissionFee)
    governanceMinimumStakeReqPercentage             = int(governance_origination.storage.config.minimumStakeReqPercentage)
    governanceMaxProposalsPerDelegate               = int(governance_origination.storage.config.maxProposalsPerDelegate)
    governanceNewBlockTimeLevel                     = int(governance_origination.storage.config.newBlockTimeLevel)
    governanceNewBlocksPerMinute                    = int(governance_origination.storage.config.newBlocksPerMinute)
    governanceBlocksPerMinute                       = int(governance_origination.storage.config.blocksPerMinute)
    governanceBlocksPerProposalRound                = int(governance_origination.storage.config.blocksPerProposalRound)
    governanceBlocksPerVotingRound                  = int(governance_origination.storage.config.blocksPerVotingRound)
    governanceBlocksPerTimelockRound                = int(governance_origination.storage.config.blocksPerTimelockRound)
    governanceFinancialRequestApprovalPercentage    = int(governance_origination.storage.config.financialRequestApprovalPercentage)
    governanceFinancialRequestDurationInDays        = int(governance_origination.storage.config.financialRequestDurationInDays)
    governanceStartLevel                            = int(governance_origination.storage.startLevel)
    governanceCurrentRound                          = governance_origination.storage.currentRound
    governanceCurrentRoundStartLevel                = int(governance_origination.storage.currentRoundStartLevel)
    governanceCurrentRoundEndLevel                  = int(governance_origination.storage.currentRoundEndLevel)
    governanceCurrentCycleEndLevel                  = int(governance_origination.storage.currentCycleEndLevel)
    governanceNextProposalID                        = int(governance_origination.storage.nextProposalId)

    # Current round
    governanceRoundType = models.GovernanceRoundType.NONE
    if governanceCurrentRound == "proposal":
        governanceRoundType = models.GovernanceRoundType.PROPOSAL
    elif governanceCurrentRound == "timelock":
        governanceRoundType = models.GovernanceRoundType.TIMELOCK
    elif governanceCurrentRound == "voting":
        governanceRoundType = models.GovernanceRoundType.VOTING

    # Create record
    governance  = models.Governance(
        address                         = governanceAddress,
        next_proposal_id                = governanceNextProposalID,
        success_reward                  = governanceSuccessReward,
        min_quorum_percentage           = governanceMinQuorumPercentage,
        min_quorum_mvk_total            = governanceMinQuorumMvkTotal,
        voting_power_ratio              = governanceVotingPowerRatio,
        proposal_submission_fee         = governanceProposalSubmissionFee,
        minimum_stake_req_percentage    = governanceMinimumStakeReqPercentage,
        max_proposal_per_delegate       = governanceMaxProposalsPerDelegate,
        new_blocktime_level             = governanceNewBlockTimeLevel,
        new_block_per_minute            = governanceNewBlocksPerMinute,
        blocks_per_minute               = governanceBlocksPerMinute,
        blocks_per_proposal_round       = governanceBlocksPerProposalRound,
        blocks_per_voting_round         = governanceBlocksPerVotingRound,
        blocks_per_timelock_round       = governanceBlocksPerTimelockRound,
        financial_req_approval_percent  = governanceFinancialRequestApprovalPercentage,
        financial_req_duration_in_days  = governanceFinancialRequestDurationInDays,
        start_level                     = governanceStartLevel,
        current_round                   = governanceRoundType,
        current_round_start_level       = governanceCurrentRoundStartLevel,
        current_round_end_level         = governanceCurrentRoundEndLevel,
        current_cycle_end_level         = governanceCurrentCycleEndLevel
    )
    await governance.save()
