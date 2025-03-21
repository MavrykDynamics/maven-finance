from dipdup.context import HookContext


async def refresh_views(
    ctx: HookContext,
) -> None:
    try:
        await ctx.execute_sql_script('refresh_views')
    except:
        return