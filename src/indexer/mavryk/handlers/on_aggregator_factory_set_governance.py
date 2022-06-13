
from mavryk.types.aggregator_factory.parameter.set_governance import SetGovernanceParameter
from dipdup.models import Transaction
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext

async def on_aggregator_factory_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, AggregatorFactoryStorage],
) -> None:
    ...