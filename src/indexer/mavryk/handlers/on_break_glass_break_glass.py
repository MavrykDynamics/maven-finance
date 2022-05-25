
from dipdup.context import HandlerContext
from mavryk.types.break_glass.storage import BreakGlassStorage
from dipdup.models import Transaction
from mavryk.types.break_glass.parameter.break_glass import BreakGlassParameter
import mavryk.models as models

async def on_break_glass_break_glass(
    ctx: HandlerContext,
    break_glass: Transaction[BreakGlassParameter, BreakGlassStorage],
) -> None:

    # Get operation values
    breakGlassAddress       = break_glass.data.target_address
    breakGlassGlassBroken   = break_glass.storage.glassBroken

    # Update record
    breakGlass  = await models.BreakGlass.get(
        address = breakGlassAddress
    )
    breakGlass.glass_broken = breakGlassGlassBroken
    await breakGlass.save()
