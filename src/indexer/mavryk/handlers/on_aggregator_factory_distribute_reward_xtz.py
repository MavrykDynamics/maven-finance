
from dipdup.models import Transaction
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from mavryk.types.aggregator_factory.parameter.distribute_reward_xtz import DistributeRewardXtzParameter
from dipdup.context import HandlerContext

async def on_aggregator_factory_distribute_reward_xtz(
    ctx: HandlerContext,
    distribute_reward_xtz: Transaction[DistributeRewardXtzParameter, AggregatorFactoryStorage],
) -> None:
    ...