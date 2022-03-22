
from dipdup.context import HandlerContext
from mavryk.types.emergency_governance.storage import EmergencyGovernanceStorage
from dipdup.models import Transaction
from mavryk.types.emergency_governance.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configMinStakedMvkForTrigger, UpdateConfigActionItem1 as configMinStakedMvkForVoting, UpdateConfigActionItem2 as configRequiredFee, UpdateConfigActionItem3 as configStakedMvkPercentRequired, UpdateConfigActionItem4 as configVoteExpiryDays
import mavryk.models as models

async def on_emergency_governance_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, EmergencyGovernanceStorage],
) -> None:
    # Get operation values
    emergencyAddress        = update_config.data.target_address
    updatedValue            = update_config.parameter.updateConfigNewValue
    updateConfigAction      = type(update_config.parameter.updateConfigAction)

    # Update contract
    emergency = await models.EmergencyGovernance.get(
        address = emergencyAddress
    )
    if updateConfigAction == configMinStakedMvkForTrigger:
        emergency.min_smvk_required_to_trigger      = float(updatedValue)
    elif updateConfigAction == configMinStakedMvkForVoting:
        emergency.min_smvk_required_to_vote         = float(updatedValue)
    elif updateConfigAction == configRequiredFee:
        emergency.required_fee                      = float(updatedValue)
    elif updateConfigAction == configStakedMvkPercentRequired:
        emergency.smvk_percentage_required          = int(updatedValue)
    elif updateConfigAction == configVoteExpiryDays:
        emergency.vote_expiry_days                  = int(updatedValue)

    await emergency.save()
