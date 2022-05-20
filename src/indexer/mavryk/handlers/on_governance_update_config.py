
from dipdup.context import HandlerContext
from mavryk.types.governance.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configBlocksPerMinute, UpdateConfigActionItem1 as configBlocksPerProposalRound, UpdateConfigActionItem2 as configBlocksPerTimelockRound, UpdateConfigActionItem3 as configBlocksPerVotingRound, UpdateConfigActionItem4 as configFinancialReqApprovalPct, UpdateConfigActionItem5 as configFinancialReqDurationDays, UpdateConfigActionItem6 as configMaxProposalsPerDelegate, UpdateConfigActionItem7 as configMinProposalRoundVotePct, UpdateConfigActionItem8 as configMinProposalRoundVotesReq, UpdateConfigActionItem9 as configMinQuorumMvkTotal, UpdateConfigActionItem10 as configMinQuorumPercentage, UpdateConfigActionItem11 as configMinimumStakeReqPercentage, UpdateConfigActionItem12 as configNewBlockTimeLevel, UpdateConfigActionItem13 as configNewBlocksPerMinute, UpdateConfigActionItem14 as configProposalSubmissionFee, UpdateConfigActionItem15 as configSuccessReward, UpdateConfigActionItem16 as configVotingPowerRatio
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_governance_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, GovernanceStorage],
) -> None:
    # Get operation values
    governanceAddress       = update_config.data.target_address
    updatedValue            = int(update_config.parameter.updateConfigNewValue)
    updateConfigAction      = type(update_config.parameter.updateConfigAction)

    # Update contract
    governance = await models.Governance.get(
        address = governanceAddress
    )
    # if updateConfigAction == configBlocksPerMinute:
    #     governance.blocks_per_minute                = updatedValue
    # elif updateConfigAction == configBlocksPerProposalRound:
    #     governance.blocks_per_proposal_round        = updatedValue
    # elif updateConfigAction == configBlocksPerTimelockRound:
    #     governance.blocks_per_timelock_round        = updatedValue
    # elif updateConfigAction == configBlocksPerVotingRound:
    #     governance.blocks_per_voting_round          = updatedValue
    # elif updateConfigAction == configMaxProposalsPerDelegate:
    #     governance.max_proposal_per_delegate        = updatedValue
    # elif updateConfigAction == configMinQuorumMvkTotal:
    #     governance.min_quorum_mvk_total             = updatedValue
    # elif updateConfigAction == configMinQuorumPercentage:
    #     governance.min_quorum_percentage            = updatedValue
    # elif updateConfigAction == configMinimumStakeReqPercentage:
    #     governance.minimum_stake_req_percentage     = updatedValue
    # elif updateConfigAction == configNewBlockTimeLevel:
    #     governance.new_blocktime_level              = updatedValue
    # elif updateConfigAction == configNewBlocksPerMinute:
    #     governance.new_block_per_minute             = updatedValue
    # elif updateConfigAction == configProposalSubmissionFee:
    #     governance.proposal_submission_fee          = updatedValue
    # elif updateConfigAction == configSuccessReward:
    #     governance.success_reward                   = updatedValue
    # elif updateConfigAction == configVotingPowerRatio:
    #     governance.voting_power_ratio               = updatedValue
    # elif updateConfigAction == configFinancialReqApprovalPct:
    #     governance.financial_req_approval_percent   = updatedValue
    # elif updateConfigAction == configFinancialReqDurationDays:
    #     governance.financial_req_duration_in_days   = updatedValue
    # elif updateConfigAction == configMinProposalRoundVotePct:
    #     governance.proposal_round_vote_percentage   = updatedValue
    # elif updateConfigAction == configMinProposalRoundVotesReq:
    #     governance.proposal_round_vote_required     = updatedValue

    await governance.save()
