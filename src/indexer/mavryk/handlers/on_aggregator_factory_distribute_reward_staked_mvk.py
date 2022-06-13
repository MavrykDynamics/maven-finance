
from mavryk.types.aggregator_factory.parameter.distribute_reward_staked_mvk import DistributeRewardStakedMvkParameter
from dipdup.models import Transaction
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext

async def on_aggregator_factory_distribute_reward_staked_mvk(
    ctx: HandlerContext,
    distribute_reward_staked_mvk: Transaction[DistributeRewardStakedMvkParameter, AggregatorFactoryStorage],
) -> None:
    ...