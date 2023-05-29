from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.types.governance.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configBlocksPerProposalRound, UpdateConfigActionItem1 as configBlocksPerTimelockRound, UpdateConfigActionItem2 as configBlocksPerVotingRound, UpdateConfigActionItem3 as configCycleVotersReward, UpdateConfigActionItem4 as configMaxProposalsPerSatellite, UpdateConfigActionItem5 as configMinProposalRoundVotePct, UpdateConfigActionItem6 as configMinProposalRoundVotesReq, UpdateConfigActionItem7 as configMinQuorumPercentage, UpdateConfigActionItem8 as configMinYayVotePercentage, UpdateConfigActionItem9 as configProposalCodeMaxLength, UpdateConfigActionItem10 as configProposalDatTitleMaxLength, UpdateConfigActionItem11 as configProposalDescMaxLength, UpdateConfigActionItem12 as configProposalInvoiceMaxLength, UpdateConfigActionItem13 as configProposalTitleMaxLength, UpdateConfigActionItem14 as configProposeFeeMutez, UpdateConfigActionItem15 as configSuccessReward
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_governance_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, GovernanceStorage],
) -> None:

    try:
        # Get operation values
        governance_address      = update_config.data.target_address
        updated_value           = int(update_config.parameter.updateConfigNewValue)
        update_config_action    = type(update_config.parameter.updateConfigAction)
        timestamp               = update_config.data.timestamp
    
        # Update contract
        governance = await models.Governance.get(
            network = ctx.datasource.network,
            address = governance_address
        )
        governance.last_updated_at  = timestamp
    
        if update_config_action == configBlocksPerProposalRound:
            governance.blocks_per_proposal_round                = int(updated_value)
        elif update_config_action == configBlocksPerTimelockRound:
            governance.blocks_per_timelock_round                = int(updated_value)
        elif update_config_action == configBlocksPerVotingRound:
            governance.blocks_per_voting_round                  = int(updated_value)
        elif update_config_action == configCycleVotersReward:
            governance.cycle_voters_reward                      = float(updated_value)
        elif update_config_action == configMaxProposalsPerSatellite:
            governance.max_proposal_per_satellite               = int(updated_value)
        elif update_config_action == configMinProposalRoundVotePct:
            governance.proposal_round_vote_percentage           = int(updated_value)
        elif update_config_action == configMinProposalRoundVotesReq:
            governance.proposal_round_vote_required             = int(updated_value)
        elif update_config_action == configMinYayVotePercentage:
            governance.min_yay_vote_percentage                  = int(updated_value)
        elif update_config_action == configMinQuorumPercentage:
            governance.min_quorum_percentage                    = int(updated_value)
        elif update_config_action == configProposalCodeMaxLength:
            governance.proposal_source_code_max_length          = int(updated_value)
        elif update_config_action == configProposalDatTitleMaxLength:
            governance.proposal_metadata_title_max_length       = int(updated_value)
        elif update_config_action == configProposalDescMaxLength:
            governance.proposal_description_max_length          = int(updated_value)
        elif update_config_action == configProposalInvoiceMaxLength:
            governance.proposal_invoice_max_length              = int(updated_value)
        elif update_config_action == configProposalTitleMaxLength:
            governance.proposal_title_max_length                = int(updated_value)
        elif update_config_action == configProposeFeeMutez:
            governance.proposal_submission_fee_mutez            = int(updated_value)
        elif update_config_action == configSuccessReward:
            governance.success_reward                           = float(updated_value)
    
        await governance.save()
    except BaseException as e:
         await save_error_report(e)

