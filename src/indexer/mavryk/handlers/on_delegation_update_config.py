from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configDelegationRatio, UpdateConfigActionItem1 as configMaxSatellites, UpdateConfigActionItem2 as configMinimumStakedMvkBalance, UpdateConfigActionItem3 as configSatDescMaxLength, UpdateConfigActionItem4 as configSatImageMaxLength, UpdateConfigActionItem5 as configSatNameMaxLength, UpdateConfigActionItem6 as configSatWebsiteMaxLength
from mavryk.types.delegation.storage import DelegationStorage
import mavryk.models as models

async def on_delegation_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, DelegationStorage],
) -> None:

    try:
        # Get operation values
        delegation_address      = update_config.data.target_address
        updated_value           = int(update_config.parameter.updateConfigNewValue)
        update_config_action    = type(update_config.parameter.updateConfigAction)
        timestamp               = update_config.data.timestamp
    
        # Update contract
        delegation = await models.Delegation.get(
            address = delegation_address
        )
        delegation.last_updated_at  = timestamp
        if update_config_action == configDelegationRatio:
            delegation.delegation_ratio                 = updated_value
        elif update_config_action == configMaxSatellites:
            delegation.max_satellites                   = updated_value
        elif update_config_action == configMinimumStakedMvkBalance:
            delegation.minimum_smvk_balance             = updated_value
        elif update_config_action == configSatDescMaxLength:
            delegation.satellite_description_max_length = updated_value
        elif update_config_action == configSatImageMaxLength:
            delegation.satellite_image_max_length       = updated_value
        elif update_config_action == configSatNameMaxLength:
            delegation.satellite_name_max_length        = updated_value
        elif update_config_action == configSatWebsiteMaxLength:
            delegation.satellite_website_max_length     = updated_value
        
        await delegation.save()

    except BaseException as e:
         await save_error_report(e)

