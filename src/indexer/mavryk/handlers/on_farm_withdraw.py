
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage
from mavryk.types.farm.parameter.withdraw import WithdrawParameter
from dipdup.models import Transaction

async def on_farm_withdraw(
    ctx: HandlerContext,
    withdraw: Transaction[WithdrawParameter, FarmStorage],
) -> None:
    ...