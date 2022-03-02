
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage
from mavryk.types.farm.parameter.toggle_pause_withdraw import TogglePauseWithdrawParameter
from dipdup.models import Transaction

async def on_farm_toggle_pause_withdraw(
    ctx: HandlerContext,
    toggle_pause_withdraw: Transaction[TogglePauseWithdrawParameter, FarmStorage],
) -> None:
    ...