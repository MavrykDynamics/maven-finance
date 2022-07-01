
from dipdup.models import Transaction
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.context import HandlerContext
from mavryk.types.aggregator.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter

async def on_aggregator_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, AggregatorStorage],
) -> None:
    ...