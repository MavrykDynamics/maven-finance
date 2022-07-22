
from mavryk.types.farm_factory.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from dipdup.models import Transaction
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.context import HandlerContext

async def on_farm_factory_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, FarmFactoryStorage],
) -> None:
    breakpoint()