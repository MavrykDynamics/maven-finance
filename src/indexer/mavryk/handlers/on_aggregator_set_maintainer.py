
from mavryk.types.aggregator.parameter.set_maintainer import SetMaintainerParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_set_maintainer(
    ctx: HandlerContext,
    set_maintainer: Transaction[SetMaintainerParameter, AggregatorStorage],
) -> None:

    # Get operation info
    aggregator_address      = set_maintainer.data.target_address
    maintainer_address      = set_maintainer.parameter.__root__

    # Update record
    maintainer, _           = await models.MavrykUser.get_or_create(address = maintainer_address)
    await maintainer.save()
    aggregator              = await models.Aggregator.get(address   = aggregator_address)
    aggregator.maintainer   = maintainer
    await aggregator.save()
