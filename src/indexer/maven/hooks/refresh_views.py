from dipdup.context import HookContext


async def refresh_views(
    ctx: HookContext,
) -> None:
    try:
        print("Refreshing MATERIALIZED VIEWS")
        await ctx.execute_sql_script('refresh_materialized_loan_token_view')
        print("refresh_materialized_loan_token_view")
        await ctx.execute_sql_script('refresh_materialized_tvl_stats')
        print("refresh_materialized_tvl_stats")
        await ctx.execute_sql_script('refresh_materialized_user_dashboard')
        print("refresh_materialized_user_dashboard")
        await ctx.execute_sql_script('refresh_materialized_vault_collateral_view')
        print("MATERIALIrefresh_materialized_vault_collateral_view")
    except:
        print("Error while refreshing MATERIALIZED VIEWS")
        return