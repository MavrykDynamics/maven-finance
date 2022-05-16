
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from mavryk.types.treasury_factory.parameter.toggle_pause_create_treasury import TogglePauseCreateTreasuryParameter
from dipdup.models import Transaction

async def on_treasury_factory_toggle_pause_create_treasury(
    ctx: HandlerContext,
    toggle_pause_create_treasury: Transaction[TogglePauseCreateTreasuryParameter, TreasuryFactoryStorage],
) -> None:
    ...