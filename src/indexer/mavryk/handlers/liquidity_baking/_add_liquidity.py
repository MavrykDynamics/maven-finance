from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.liquidity_baking.parameter.add_liquidity import AddLiquidityParameter
from mavryk.types.liquidity_baking.storage import LiquidityBakingStorage
from mavryk.types.sirius.parameter.mint_or_burn import MintOrBurnParameter
from mavryk.types.sirius.storage import SiriusStorage
from mavryk.types.tzbtc.parameter.transfer import TransferParameter
from mavryk.types.tzbtc.storage import TzbtcStorage


async def _add_liquidity(
    ctx: HandlerContext,
    add_liquidity: Transaction[AddLiquidityParameter, LiquidityBakingStorage],
    transfer: Transaction[TransferParameter, TzbtcStorage],
    mint_or_burn: Transaction[MintOrBurnParameter, SiriusStorage],
) -> None:
    ...