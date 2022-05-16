
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from mavryk.types.treasury_factory.parameter.untrack_treasury import UntrackTreasuryParameter
from dipdup.models import Transaction

async def on_treasury_factory_untrack_treasury(
    ctx: HandlerContext,
    untrack_treasury: Transaction[UntrackTreasuryParameter, TreasuryFactoryStorage],
) -> None:
    ...