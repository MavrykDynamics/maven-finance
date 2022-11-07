
from dipdup.context import HookContext
import mavryk.models as models

async def on_synchronized(
    ctx: HookContext,
) -> None:
    await ctx.execute_sql('on_synchronized')
    models.mavryk_user_cache.clear()
