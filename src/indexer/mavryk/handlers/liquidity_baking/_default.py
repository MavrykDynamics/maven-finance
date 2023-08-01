from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.liquidity_baking.parameter.default import DefaultParameter
from mavryk.types.liquidity_baking.storage import LiquidityBakingStorage


async def _default(
    ctx: HandlerContext,
    default: Transaction[DefaultParameter, LiquidityBakingStorage],
) -> None:
    ...