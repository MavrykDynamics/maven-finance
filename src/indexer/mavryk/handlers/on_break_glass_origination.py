
from dipdup.models import Origination
from dipdup.context import HandlerContext
from mavryk.types.break_glass.storage import BreakGlassStorage
import mavryk.models as models

async def on_break_glass_origination(
    ctx: HandlerContext,
    break_glass_origination: Origination[BreakGlassStorage],
) -> None:
    # Get operation values
    breakGlassAddress               = break_glass_origination.data.originated_contract_address
    breakGlassThreshold             = int(break_glass_origination.storage.config.threshold)
    breakGlassActionExpiryDays      = int(break_glass_origination.storage.config.actionExpiryDays)
    breakGlassGlassBroken           = break_glass_origination.storage.glassBroken
    breakGlassActionCounter         = break_glass_origination.storage.actionCounter
    councilMembers                  = break_glass_origination.storage.councilMembers

    # Create record
    breakGlass  = models.BreakGlass(
        address                 = breakGlassAddress,
        threshold               = breakGlassThreshold,
        action_expiry_days      = breakGlassActionExpiryDays,
        glass_broken            = breakGlassGlassBroken,
        action_counter          = breakGlassActionCounter
    )
    await breakGlass.save()

    for member in councilMembers:
        user, _ = await models.MavrykUser.get_or_create(
            address = member
        )
        user.break_glass    = breakGlass
        await user.save()