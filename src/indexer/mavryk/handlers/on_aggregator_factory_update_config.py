from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.types.aggregator_factory.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configAggregatorNameMaxLength
from dipdup.models import Transaction
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
import mavryk.models as models

async def on_aggregator_factory_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, AggregatorFactoryStorage],
) -> None:

    try:
        # Get operation values
        aggregator_factory_address          = update_config.data.target_address
        updated_value                       = int(update_config.parameter.updateConfigNewValue)
        updated_config_action               = type(update_config.parameter.updateConfigAction)
        timestamp                           = update_config.data.timestamp
    
        # Update contract
        aggregator_factory          = await models.AggregatorFactory.get(
            address = aggregator_factory_address
        )
        aggregator_factory.last_updated_at  = timestamp
        if updated_config_action == configAggregatorNameMaxLength:
            aggregator_factory.aggregator_name_max_length     = updated_value
    
        await aggregator_factory.save()

    except BaseException as e:
         await save_error_report(e)

