
from dipdup.context import HookContext
import mavryk.models as models

async def on_synchronized(
    ctx: HookContext,
) -> None:

    # Execute sql script
    await ctx.execute_sql('on_synchronized')

    # Clear user cache
    await models.mavryk_user_cache.clear()
