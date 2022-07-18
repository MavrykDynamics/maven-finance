
from mavryk.types.aggregator.parameter.remove_oracle import RemoveOracleParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_remove_oracle(
    ctx: HandlerContext,
    remove_oracle: Transaction[RemoveOracleParameter, AggregatorStorage],
) -> None:

    # Get operation info
    aggregator_address      = remove_oracle.data.target_address
    oracle_address          = remove_oracle.parameter.__root__

    # Create record
    oracle, _               = await models.MavrykUser.get_or_create(address   = oracle_address)
    await oracle.save()
    aggregator              = await models.Aggregator.get(address   = aggregator_address)
    aggregator_oracle       = await models.AggregatorOracleRecord.get(
        aggregator  = aggregator,
        oracle      = oracle
    )
    await aggregator_oracle.delete()
