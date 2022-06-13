
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from mavryk.types.aggregator.parameter.toggle_pause_set_observation_commit import TogglePauseSetObservationCommitParameter
from dipdup.context import HandlerContext

async def on_aggregator_toggle_pause_set_observation_commit(
    ctx: HandlerContext,
    toggle_pause_set_observation_commit: Transaction[TogglePauseSetObservationCommitParameter, AggregatorStorage],
) -> None:
    ...