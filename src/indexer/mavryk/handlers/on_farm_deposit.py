
from mavryk.types.farm.parameter.deposit import DepositParameter
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction

async def on_farm_deposit(
    ctx: HandlerContext,
    deposit: Transaction[DepositParameter, FarmStorage],
) -> None:
    ...