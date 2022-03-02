
from dipdup.context import HandlerContext
from mavryk.types.farm.parameter.toggle_pause_claim import TogglePauseClaimParameter
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction

async def on_farm_toggle_pause_claim(
    ctx: HandlerContext,
    toggle_pause_claim: Transaction[TogglePauseClaimParameter, FarmStorage],
) -> None:
    ...