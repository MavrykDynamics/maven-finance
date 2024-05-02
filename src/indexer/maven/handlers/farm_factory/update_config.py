from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.farm_factory.tezos_storage import FarmFactoryStorage
from maven.types.farm_factory.tezos_parameters.update_config import UpdateConfigParameter
import maven.models as models

async def update_config(
    ctx: HandlerContext,
    update_config: TzktTransaction[UpdateConfigParameter, FarmFactoryStorage],
) -> None:

    try:
        # Get operation values
        farm_factory_address    = update_config.data.target_address
        timestamp               = update_config.data.timestamp
    
        # Update contract
        await models.FarmFactory.filter(
            network = ctx.datasource.name.replace('mvkt_',''),
            address = farm_factory_address
        ).update(
            last_updated_at         = timestamp,
            farm_name_max_length    = update_config.storage.config.farmNameMaxLength
        )

    except BaseException as e:
        await save_error_report(e)

