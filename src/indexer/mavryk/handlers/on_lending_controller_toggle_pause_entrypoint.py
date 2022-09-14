
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.lending_controller.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from mavryk.types.lending_controller.storage import LendingControllerStorage

async def on_lending_controller_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, LendingControllerStorage],
) -> None:

    breakpoint()
