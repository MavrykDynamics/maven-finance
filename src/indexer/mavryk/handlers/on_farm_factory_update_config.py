from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from mavryk.types.farm_factory.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configFarmNameMaxLength
import mavryk.models as models

async def on_farm_factory_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, FarmFactoryStorage],
) -> None:

    try:
        # Get operation values
        farm_factory_address    = update_config.data.target_address
        updated_value           = int(update_config.parameter.updateConfigNewValue)
        update_config_action    = type(update_config.parameter.updateConfigAction)
        timestamp               = update_config.data.timestamp
    
        # Update contract
        farm_factory = await models.FarmFactory.get(
            network = ctx.datasource.network,
            address = farm_factory_address
        )
        farm_factory.last_updated_at    = timestamp
        if update_config_action == configFarmNameMaxLength:
            farm_factory.farmNameMaxLength                 = updated_value
        
        await farm_factory.save()

    except BaseException as e:
         await save_error_report(e)

