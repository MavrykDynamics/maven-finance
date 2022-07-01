
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from mavryk.types.treasury_factory.parameter.toggle_pause_create_treasury import TogglePauseCreateTreasuryParameter
from dipdup.models import Transaction
import mavryk.models as models

async def on_treasury_factory_toggle_pause_create_treasury(
    ctx: HandlerContext,
    toggle_pause_create_treasury: Transaction[TogglePauseCreateTreasuryParameter, TreasuryFactoryStorage],
) -> None:

    # Get operation info
    treasury_factory_address    = toggle_pause_create_treasury.data.target_address
    treasury_factory            = await models.TreasuryFactory.get(address=treasury_factory_address)

    # Update record
    treasury_factory.create_treasury_paused     = toggle_pause_create_treasury.storage.breakGlassConfig.createTreasuryIsPaused
    treasury_factory.track_treasury_paused      = toggle_pause_create_treasury.storage.breakGlassConfig.trackTreasuryIsPaused
    treasury_factory.untrack_treasury_paused    = toggle_pause_create_treasury.storage.breakGlassConfig.untrackTreasuryIsPaused
    await treasury_factory.save()
