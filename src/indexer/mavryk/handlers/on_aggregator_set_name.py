from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.types.aggregator.storage import AggregatorStorage
from mavryk.types.aggregator.parameter.set_name import SetNameParameter
from dipdup.models import Transaction
import mavryk.models as models

async def on_aggregator_set_name(
    ctx: HandlerContext,
    set_name: Transaction[SetNameParameter, AggregatorStorage],
) -> None:

    try:    
        # Get operation info
        aggregator_address      = set_name.data.target_address
        name                    = set_name.parameter.__root__
    
        # Update contract
        aggregator              = await models.Aggregator.get(
            address = aggregator_address
        )
        aggregator.name         = name
        await aggregator.save()

    except BaseException:
         await save_error_report()

