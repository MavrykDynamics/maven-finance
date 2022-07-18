
from dipdup.models import Transaction
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from mavryk.types.treasury_factory.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from dipdup.context import HandlerContext

async def on_treasury_factory_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, TreasuryFactoryStorage],
) -> None:
    ...