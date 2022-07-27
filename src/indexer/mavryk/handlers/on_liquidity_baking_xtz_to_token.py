
from dipdup.models import Transaction
from mavryk.types.liquidity_baking.storage import LiquidityBakingStorage
from mavryk.types.liquidity_baking.parameter.xtz_to_token import XtzToTokenParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_liquidity_baking_xtz_to_token(
    ctx: HandlerContext,
    xtz_to_token: Transaction[XtzToTokenParameter, LiquidityBakingStorage],
) -> None:
    
    # Get operation data
    liquidity_baking_address    = xtz_to_token.data.target_address
    timestamp                   = xtz_to_token.data.timestamp
    token_pool                  = int(xtz_to_token.storage.tokenPool)
    xtz_pool                    = int(xtz_to_token.storage.xtzPool)
    lqt_total                   = int(xtz_to_token.storage.lqtTotal)
    token_address               = xtz_to_token.storage.tokenAddress
    lqt_address                 = xtz_to_token.storage.lqtAddress

    # Create / Update record
    liquidity_baking, _ = await models.LiquidityBaking.get_or_create(
        address = liquidity_baking_address
    )
    liquidity_baking.token_pool     = token_pool
    liquidity_baking.xtz_pool       = xtz_pool
    liquidity_baking.lqt_total      = lqt_total
    liquidity_baking.token_address  = token_address
    liquidity_baking.lqt_address    = lqt_address
    await liquidity_baking.save()

    xtz_pool_decimals       = xtz_pool * (10**-liquidity_baking.xtz_decimals)
    token_pool_decimals     = token_pool * (10**-liquidity_baking.token_decimals)
    xtz_token_price         = float(round(xtz_pool_decimals / token_pool_decimals, liquidity_baking.xtz_decimals))
    token_xtz_price         = float(round(token_pool_decimals / xtz_pool_decimals, liquidity_baking.token_decimals))

    liquidity_baking_history_data   = models.LiquidityBakingHistoryData(
        timestamp           = timestamp,
        liquidity_baking    = liquidity_baking,
        type                = models.DexType.XTZ_TO_TOKEN,
        token_pool          = token_pool,
        xtz_pool            = xtz_pool,
        lqt_total           = lqt_total,
        xtz_token_price     = xtz_token_price,
        token_xtz_price     = token_xtz_price
    )
    await liquidity_baking_history_data.save()
