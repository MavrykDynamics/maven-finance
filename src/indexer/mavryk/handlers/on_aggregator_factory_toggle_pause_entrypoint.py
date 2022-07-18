
from dipdup.models import Transaction
from mavryk.types.aggregator_factory.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from dipdup.context import HandlerContext
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage

async def on_aggregator_factory_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, AggregatorFactoryStorage],
) -> None:
    ...