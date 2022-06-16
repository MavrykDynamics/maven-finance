
from mavryk.types.aggregator.parameter.add_oracle import AddOracleParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_aggregator_add_oracle(
    ctx: HandlerContext,
    add_oracle: Transaction[AddOracleParameter, AggregatorStorage],
) -> None:
    ...
