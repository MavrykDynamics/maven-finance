
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury_factory.parameter.toggle_pause_track_treasury import TogglePauseTrackTreasuryParameter

async def on_treasury_factory_toggle_pause_track_treasury(
    ctx: HandlerContext,
    toggle_pause_track_treasury: Transaction[TogglePauseTrackTreasuryParameter, TreasuryFactoryStorage],
) -> None:
    ...