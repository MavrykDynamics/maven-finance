from dipdup.context import HookContext


async def refresh_views(
    ctx: HookContext,
) -> None:
    try:
        print("Refreshing MATERIALIZED VIEWS")
        await ctx.execute_sql_script('refresh_views')
        print("MATERIALIZED VIEWS refreshed")
    except:
        print("Error while refreshing MATERIALIZED VIEWS")
        return