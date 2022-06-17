
from mavryk.types.aggregator.parameter.add_oracle import AddOracleParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_add_oracle(
    ctx: HandlerContext,
    add_oracle: Transaction[AddOracleParameter, AggregatorStorage],
) -> None:

    # Get operation info
    aggregator_address      = add_oracle.data.target_address
    oracle_address          = add_oracle.parameter.__root__

    # Create record
    oracle, _               = await models.MavrykUser.get_or_create(address   = oracle_address)
    await oracle.save()
    aggregator              = await models.Aggregator.get(address   = aggregator_address)
    aggregator_oracle       = models.AggregatorOracleRecord(
        aggregator  = aggregator,
        oracle      = oracle
    )
    await aggregator_oracle.save()
