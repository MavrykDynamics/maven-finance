from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.types.emergency_governance.storage import EmergencyGovernanceStorage
from dipdup.models import Transaction
from mavryk.types.emergency_governance.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configMinStakedMvkForTrigger, UpdateConfigActionItem1 as configMinStakedMvkForVoting, UpdateConfigActionItem2 as configProposalDescMaxLength, UpdateConfigActionItem3 as configProposalTitleMaxLength, UpdateConfigActionItem4 as configRequiredFeeMutez, UpdateConfigActionItem5 as configStakedMvkPercentRequired, UpdateConfigActionItem6 as configVoteExpiryDays
import mavryk.models as models

async def on_emergency_governance_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, EmergencyGovernanceStorage],
) -> None:

    try:
        # Get operation values
        emergency_address       = update_config.data.target_address
        updated_value           = update_config.parameter.updateConfigNewValue
        update_config_action    = type(update_config.parameter.updateConfigAction)
        timestamp               = update_config.data.timestamp
    
        # Update contract
        emergency = await models.EmergencyGovernance.get(
            address = emergency_address
        )
        emergency.last_updated_at   = timestamp 
        if update_config_action == configMinStakedMvkForTrigger:
            emergency.min_smvk_required_to_trigger      = float(updated_value)
        elif update_config_action == configMinStakedMvkForVoting:
            emergency.min_smvk_required_to_vote         = float(updated_value)
        elif update_config_action == configProposalDescMaxLength:
            emergency.proposal_desc_max_length          = float(updated_value)
        elif update_config_action == configProposalTitleMaxLength:
            emergency.proposal_title_max_length         = float(updated_value)
        elif update_config_action == configRequiredFeeMutez:
            emergency.required_fee_mutez                = float(updated_value)
        elif update_config_action == configStakedMvkPercentRequired:
            emergency.smvk_percentage_required          = int(updated_value)
        elif update_config_action == configVoteExpiryDays:
            emergency.vote_expiry_days                  = int(updated_value)
    
        await emergency.save()

    except BaseException:
         await save_error_report()

