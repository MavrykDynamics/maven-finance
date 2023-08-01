from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from mavryk.types.farm_factory.parameter.update_config import UpdateConfigParameter
import mavryk.models as models

async def update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, FarmFactoryStorage],
) -> None:

    try:
        # Get operation values
        farm_factory_address    = update_config.data.target_address
        timestamp               = update_config.data.timestamp
    
        # Update contract
        await models.FarmFactory.filter(
            network = ctx.datasource.network,
            address = farm_factory_address
        ).update(
            last_updated_at         = timestamp,
            farm_name_max_length    = update_config.storage.config.farmNameMaxLength
        )

    except BaseException as e:
        await save_error_report(e)

