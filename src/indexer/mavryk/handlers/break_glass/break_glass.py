from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.types.break_glass.tezos_storage import BreakGlassStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.break_glass.tezos_parameters.break_glass import BreakGlassParameter
import mavryk.models as models

async def break_glass(
    ctx: HandlerContext,
    break_glass: TzktTransaction[BreakGlassParameter, BreakGlassStorage],
) -> None:

    try:
        # Get operation values
        breakGlassAddress       = break_glass.data.target_address
        breakGlassGlassBroken   = break_glass.storage.glassBroken
    
        # Update record
        breakGlass  = await models.BreakGlass.get(
            network = ctx.datasource.name.replace('tzkt_',''),
            address = breakGlassAddress
        )
        breakGlass.glass_broken = breakGlassGlassBroken
        await breakGlass.save()

    except BaseException as e:
        await save_error_report(e)

