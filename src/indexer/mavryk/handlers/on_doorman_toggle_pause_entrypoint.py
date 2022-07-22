
from mavryk.types.doorman.storage import DoormanStorage
from mavryk.types.doorman.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_doorman_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, DoormanStorage],
) -> None:
    breakpoint()