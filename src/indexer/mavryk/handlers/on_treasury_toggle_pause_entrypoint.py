
from mavryk.types.treasury.storage import TreasuryStorage
from mavryk.types.treasury.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_treasury_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, TreasuryStorage],
) -> None:
    breakpoint()