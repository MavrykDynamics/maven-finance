
from mavryk.types.aggregator_factory.parameter.toggle_pause_distribute_reward_s_mvk import TogglePauseDistributeRewardSMvkParameter
from dipdup.models import Transaction
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext

async def on_aggregator_factory_toggle_pause_distribute_reward_smvk(
    ctx: HandlerContext,
    toggle_pause_distribute_reward_s_mvk: Transaction[TogglePauseDistributeRewardSMvkParameter, AggregatorFactoryStorage],
) -> None:
    ...