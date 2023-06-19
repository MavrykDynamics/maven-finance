from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.parameter.update_config import UpdateConfigParameter
from mavryk.types.delegation.storage import DelegationStorage
import mavryk.models as models

async def on_delegation_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, DelegationStorage],
) -> None:

    try:
        # Get operation values
        delegation_address      = update_config.data.target_address
        timestamp               = update_config.data.timestamp
    
        # Update contract
        await models.Delegation.filter(
            network = ctx.datasource.network,
            address = delegation_address
        ).update(
            last_updated_at                     = timestamp,
            minimum_smvk_balance                = update_config.storage.config.minimumStakedMvkBalance,
            delegation_ratio                    = update_config.storage.config.delegationRatio,
            max_satellites                      = update_config.storage.config.maxSatellites,
            satellite_name_max_length           = update_config.storage.config.satelliteNameMaxLength,
            satellite_description_max_length    = update_config.storage.config.satelliteDescriptionMaxLength,
            satellite_image_max_length          = update_config.storage.config.satelliteImageMaxLength,
            satellite_website_max_length        = update_config.storage.config.satelliteWebsiteMaxLength
        )

    except BaseException as e:
         await save_error_report(e)

