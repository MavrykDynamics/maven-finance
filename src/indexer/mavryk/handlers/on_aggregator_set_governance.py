
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from mavryk.types.aggregator.parameter.set_governance import SetGovernanceParameter
from dipdup.context import HandlerContext

async def on_aggregator_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, AggregatorStorage],
) -> None:
    ...
