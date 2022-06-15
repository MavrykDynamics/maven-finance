
from mavryk.types.aggregator.parameter.toggle_pause_set_observation_reveal import TogglePauseSetObservationRevealParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_aggregator_toggle_pause_set_observation_reveal(
    ctx: HandlerContext,
    toggle_pause_set_observation_reveal: Transaction[TogglePauseSetObservationRevealParameter, AggregatorStorage],
) -> None:

    # Get operation info
    breakpoint()
