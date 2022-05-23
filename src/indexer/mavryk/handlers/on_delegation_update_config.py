
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configDelegationRatio, UpdateConfigActionItem1 as configMaxSatellites, UpdateConfigActionItem2 as configMinimumStakedMvkBalance, UpdateConfigActionItem3 as configSatDescMaxLength, UpdateConfigActionItem4 as configSatImageMaxLength, UpdateConfigActionItem5 as configSatNameMaxLength, UpdateConfigActionItem6 as configSatWebsiteMaxLength
from mavryk.types.delegation.storage import DelegationStorage
import mavryk.models as models

async def on_delegation_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, DelegationStorage],
) -> None:

    # Get operation values
    delegationAddress       = update_config.data.target_address
    updatedValue            = int(update_config.parameter.updateConfigNewValue)
    updateConfigAction      = type(update_config.parameter.updateConfigAction)

    # Update contract
    delegation = await models.Delegation.get(
        address = delegationAddress
    )
    if updateConfigAction == configDelegationRatio:
        delegation.delegation_ratio                 = updatedValue
    elif updateConfigAction == configMaxSatellites:
        delegation.max_satellites                   = updatedValue
    elif updateConfigAction == configMinimumStakedMvkBalance:
        delegation.minimum_smvk_balance             = updatedValue
    elif updateConfigAction == configSatDescMaxLength:
        delegation.satellite_description_max_length = updatedValue
    elif updateConfigAction == configSatImageMaxLength:
        delegation.satellite_image_max_length       = updatedValue
    elif updateConfigAction == configSatNameMaxLength:
        delegation.satellite_name_max_length        = updatedValue
    elif updateConfigAction == configSatWebsiteMaxLength:
        delegation.satellite_website_max_length     = updatedValue
    
    await delegation.save()
