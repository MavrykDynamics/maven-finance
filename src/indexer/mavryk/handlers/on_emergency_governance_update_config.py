
from dipdup.context import HandlerContext
from mavryk.types.emergency_governance.storage import EmergencyGovernanceStorage
from dipdup.models import Transaction
from mavryk.types.emergency_governance.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configRequiredFee, UpdateConfigActionItem1 as configStakedMvkPercentRequired, UpdateConfigActionItem2 as configVoteExpiryDays  
import mavryk.models as models

async def on_emergency_governance_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, EmergencyGovernanceStorage],
) -> None:
    # Get operation values
    emergencyAddress        = update_config.data.target_address
    updatedValue            = int(update_config.parameter.updateConfigNewValue)
    updateConfigAction      = type(update_config.parameter.updateConfigAction)

    # Update contract
    emergency = await models.EmergencyGovernance.get(
        address = emergencyAddress
    )
    if updateConfigAction == configRequiredFee:
        emergency.required_fee                  = updatedValue
    elif updateConfigAction == configStakedMvkPercentRequired:
        emergency.smvk_percentage_required      = updatedValue
    elif updateConfigAction == configVoteExpiryDays:
        emergency.vote_expiry_days              = updatedValue

    await emergency.save()
