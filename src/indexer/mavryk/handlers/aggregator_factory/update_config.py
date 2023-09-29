from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.types.aggregator_factory.tezos_parameters.update_config import UpdateConfigParameter
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.aggregator_factory.tezos_storage import AggregatorFactoryStorage
import mavryk.models as models

async def update_config(
    ctx: HandlerContext,
    update_config: TzktTransaction[UpdateConfigParameter, AggregatorFactoryStorage],
) -> None:

    try:
        # Get operation values
        aggregator_factory_address          = update_config.data.target_address
        timestamp                           = update_config.data.timestamp
    
        # Update contract
        await models.AggregatorFactory.filter(
            network = ctx.datasource.name.replace('tzkt_',''),
            address = aggregator_factory_address
        ).update(
            last_updated_at                 = timestamp,
            aggregator_name_max_length      = update_config.storage.config.aggregatorNameMaxLength
        )

    except BaseException as e:
        await save_error_report(e)

