
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury_factory.parameter.toggle_pause_untrack_treasury import TogglePauseUntrackTreasuryParameter

async def on_treasury_factory_toggle_pause_untrack_treasury(
    ctx: HandlerContext,
    toggle_pause_untrack_treasury: Transaction[TogglePauseUntrackTreasuryParameter, TreasuryFactoryStorage],
) -> None:
    ...