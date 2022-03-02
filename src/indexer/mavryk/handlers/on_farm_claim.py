
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage
from mavryk.types.farm.parameter.claim import ClaimParameter
from dipdup.models import Transaction

async def on_farm_claim(
    ctx: HandlerContext,
    claim: Transaction[ClaimParameter, FarmStorage],
) -> None:
    ...