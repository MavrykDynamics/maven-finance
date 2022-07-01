
from dipdup.models import Transaction
from mavryk.types.farm.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage

async def on_farm_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, FarmStorage],
) -> None:
    ...