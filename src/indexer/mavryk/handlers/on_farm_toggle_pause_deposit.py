
from dipdup.context import HandlerContext
from mavryk.types.farm.parameter.toggle_pause_deposit import TogglePauseDepositParameter
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction

async def on_farm_toggle_pause_deposit(
    ctx: HandlerContext,
    toggle_pause_deposit: Transaction[TogglePauseDepositParameter, FarmStorage],
) -> None:
    ...