from dipdup.context import HandlerContext
from dipdup.models import OperationData
from dipdup.models import Transaction
from mavryk.types.liquidity_baking.parameter.token_to_xtz import TokenToXtzParameter
from mavryk.types.liquidity_baking.storage import LiquidityBakingStorage
from mavryk.types.tzbtc.parameter.transfer import TransferParameter
from mavryk.types.tzbtc.storage import TzbtcStorage


async def _token_to_xtz(
    ctx: HandlerContext,
    token_to_xtz: Transaction[TokenToXtzParameter, LiquidityBakingStorage],
    transfer: Transaction[TransferParameter, TzbtcStorage],
    transaction_2: OperationData,
    transaction_3: OperationData,
) -> None:
    ...