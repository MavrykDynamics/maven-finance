
from dipdup.context import HandlerContext
from mavryk.types.governance.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configBlocksPerProposalRound, UpdateConfigActionItem1 as configBlocksPerTimelockRound, UpdateConfigActionItem2 as configBlocksPerVotingRound, UpdateConfigActionItem3 as configCycleVotersReward, UpdateConfigActionItem4 as configMaxProposalsPerDelegate, UpdateConfigActionItem5 as configMinProposalRoundVotePct, UpdateConfigActionItem6 as configMinProposalRoundVotesReq, UpdateConfigActionItem7 as configMinQuorumStakedMvkTotal, UpdateConfigActionItem8 as configMinQuorumPercentage, UpdateConfigActionItem9 as configProposalCodeMaxLength, UpdateConfigActionItem10 as configProposalDatTitleMaxLength, UpdateConfigActionItem11 as configProposalDescMaxLength, UpdateConfigActionItem12 as configProposalInvoiceMaxLength, UpdateConfigActionItem13 as configProposalTitleMaxLength, UpdateConfigActionItem14 as configProposeFeeMutez, UpdateConfigActionItem15 as configSuccessReward, UpdateConfigActionItem16 as configVotingPowerRatio
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

    #TODO: fix config without minSMVK (check if it is now)
    # if updateConfigAction == configBlocksPerProposalRound:
    #     governance.blocks_per_proposal_round                = int(updatedValue)
    # elif updateConfigAction == configBlocksPerTimelockRound:
    #     governance.blocks_per_timelock_round                = int(updatedValue)
    # elif updateConfigAction == configBlocksPerVotingRound:
    #     governance.blocks_per_voting_round                  = int(updatedValue)
    # elif updateConfigAction == configCycleVotersReward:
    #     governance.cycle_voters_reward                      = float(updatedValue)
    # elif updateConfigAction == configMaxProposalsPerDelegate:
    #     governance.max_proposal_per_delegate                = int(updatedValue)
    # elif updateConfigAction == configMinProposalRoundVotePct:
    #     governance.proposal_round_vote_percentage           = int(updatedValue)
    # elif updateConfigAction == configMinProposalRoundVotesReq:
    #     governance.proposal_round_vote_required             = int(updatedValue)
    # elif updateConfigAction == configMinQuorumStakedMvkTotal:
    #     governance.quorum_smvk_total                        = float(updatedValue)
    # elif updateConfigAction == configMinQuorumPercentage:
    #     governance.quorum_percentage                        = int(updatedValue)
    # elif updateConfigAction == configProposalCodeMaxLength:
    #     governance.proposal_source_code_max_length          = int(updatedValue)
    # elif updateConfigAction == configProposalDatTitleMaxLength:
    #     governance.proposal_metadata_title_max_length       = int(updatedValue)
    # elif updateConfigAction == configProposalDescMaxLength:
    #     governance.proposal_description_max_length          = int(updatedValue)
    # elif updateConfigAction == configProposalInvoiceMaxLength:
    #     governance.proposal_invoice_max_length              = int(updatedValue)
    # elif updateConfigAction == configProposalTitleMaxLength:
    #     governance.proposal_title_max_length                = int(updatedValue)
    # elif updateConfigAction == configProposeFeeMutez:
    #     governance.proposal_submission_fee_mutez            = int(updatedValue)
    # elif updateConfigAction == configSuccessReward:
    #     governance.success_reward                           = float(updatedValue)
    # elif updateConfigAction == configVotingPowerRatio:
    #     governance.voting_power_ratio                       = int(updatedValue)

    # await governance.save()