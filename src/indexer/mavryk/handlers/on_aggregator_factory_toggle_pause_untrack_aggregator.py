
from mavryk.types.aggregator_factory.parameter.toggle_pause_untrack_aggregator import TogglePauseUntrackAggregatorParameter
from dipdup.models import Transaction
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext

async def on_aggregator_factory_toggle_pause_untrack_aggregator(
    ctx: HandlerContext,
    toggle_pause_untrack_aggregator: Transaction[TogglePauseUntrackAggregatorParameter, AggregatorFactoryStorage],
) -> None:
    ...