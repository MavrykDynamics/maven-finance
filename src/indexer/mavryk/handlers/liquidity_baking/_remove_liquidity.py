from dipdup.context import HandlerContext
from dipdup.models import OperationData
from dipdup.models import Transaction
from mavryk.types.liquidity_baking.parameter.remove_liquidity import RemoveLiquidityParameter
from mavryk.types.liquidity_baking.storage import LiquidityBakingStorage
from mavryk.types.sirius.parameter.mint_or_burn import MintOrBurnParameter
from mavryk.types.sirius.storage import SiriusStorage
from mavryk.types.tzbtc.parameter.transfer import TransferParameter
from mavryk.types.tzbtc.storage import TzbtcStorage


async def _remove_liquidity(
    ctx: HandlerContext,
    remove_liquidity: Transaction[RemoveLiquidityParameter, LiquidityBakingStorage],
    mint_or_burn: Transaction[MintOrBurnParameter, SiriusStorage],
    transfer: Transaction[TransferParameter, TzbtcStorage],
    transaction_3: OperationData,
) -> None:
    ...