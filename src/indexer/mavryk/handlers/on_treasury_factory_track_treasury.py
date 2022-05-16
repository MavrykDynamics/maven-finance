
from mavryk.types.treasury_factory.parameter.track_treasury import TrackTreasuryParameter
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction

async def on_treasury_factory_track_treasury(
    ctx: HandlerContext,
    track_treasury: Transaction[TrackTreasuryParameter, TreasuryFactoryStorage],
) -> None:
    ...