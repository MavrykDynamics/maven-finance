from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext
from maven.types.delegation.tezos_parameters.update_config import UpdateConfigParameter
from maven.types.delegation.tezos_storage import DelegationStorage
import maven.models as models

async def update_config(
    ctx: HandlerContext,
    update_config: TzktTransaction[UpdateConfigParameter, DelegationStorage],
) -> None:

    try:
        # Get operation values
        delegation_address      = update_config.data.target_address
        timestamp               = update_config.data.timestamp
    
        # Update contract
        await models.Delegation.filter(
            network = ctx.datasource.name.replace('tzkt_',''),
            address = delegation_address
        ).update(
            last_updated_at                     = timestamp,
            minimum_smvn_balance                = update_config.storage.config.minimumStakedMvnBalance,
            delegation_ratio                    = update_config.storage.config.delegationRatio,
            max_satellites                      = update_config.storage.config.maxSatellites,
            satellite_name_max_length           = update_config.storage.config.satelliteNameMaxLength,
            satellite_description_max_length    = update_config.storage.config.satelliteDescriptionMaxLength,
            satellite_image_max_length          = update_config.storage.config.satelliteImageMaxLength,
            satellite_website_max_length        = update_config.storage.config.satelliteWebsiteMaxLength
        )

    except BaseException as e:
        await save_error_report(e)

