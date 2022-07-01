
from dipdup.models import Transaction
from mavryk.types.doorman.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from dipdup.context import HandlerContext
from mavryk.types.doorman.storage import DoormanStorage

async def on_doorman_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, DoormanStorage],
) -> None:
    ...