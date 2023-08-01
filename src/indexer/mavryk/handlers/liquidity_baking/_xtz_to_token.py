from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.liquidity_baking.parameter.xtz_to_token import XtzToTokenParameter
from mavryk.types.liquidity_baking.storage import LiquidityBakingStorage
from mavryk.types.tzbtc.parameter.transfer import TransferParameter
from mavryk.types.tzbtc.storage import TzbtcStorage


async def _xtz_to_token(
    ctx: HandlerContext,
    xtz_to_token: Transaction[XtzToTokenParameter, LiquidityBakingStorage],
    transfer: Transaction[TransferParameter, TzbtcStorage],
) -> None:
    ...