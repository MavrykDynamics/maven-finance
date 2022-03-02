
from mavryk.types.doorman.parameter.farm_claim_complete import FarmClaimCompleteParameter
from dipdup.context import HandlerContext
from mavryk.types.doorman.storage import DoormanStorage
from dipdup.models import Transaction

async def on_doorman_farm_claim_complete(
    ctx: HandlerContext,
    farm_claim_complete: Transaction[FarmClaimCompleteParameter, DoormanStorage],
) -> None:
    ...