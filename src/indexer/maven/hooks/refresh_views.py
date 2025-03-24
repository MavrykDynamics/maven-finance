from dipdup.context import HookContext


async def refresh_views(
    ctx: HookContext,
) -> None:
    # Regular views are used instead of materialized views,
    # so no refresh is needed as they're calculated on demand
    print("Using regular views instead of materialized views - no refresh needed")
    return