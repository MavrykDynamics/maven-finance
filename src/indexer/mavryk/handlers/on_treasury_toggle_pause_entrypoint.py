
from dipdup.models import Transaction
from mavryk.types.treasury.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from mavryk.types.treasury.storage import TreasuryStorage
from dipdup.context import HandlerContext

async def on_treasury_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, TreasuryStorage],
) -> None:
    ...