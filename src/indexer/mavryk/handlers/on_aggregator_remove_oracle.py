
from mavryk.types.aggregator.parameter.remove_oracle import RemoveOracleParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_aggregator_remove_oracle(
    ctx: HandlerContext,
    remove_oracle: Transaction[RemoveOracleParameter, AggregatorStorage],
) -> None:
    ...