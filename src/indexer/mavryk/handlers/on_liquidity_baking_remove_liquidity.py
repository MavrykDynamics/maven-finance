
from dipdup.models import Transaction
from mavryk.types.liquidity_baking.storage import LiquidityBakingStorage
from dipdup.context import HandlerContext
from mavryk.types.liquidity_baking.parameter.remove_liquidity import RemoveLiquidityParameter
import mavryk.models as models

async def on_liquidity_baking_remove_liquidity(
    ctx: HandlerContext,
    remove_liquidity: Transaction[RemoveLiquidityParameter, LiquidityBakingStorage],
) -> None:
    
    # Get operation data
    liquidity_baking_address    = remove_liquidity.data.target_address
    timestamp                   = remove_liquidity.data.timestamp
    token_pool                  = int(remove_liquidity.storage.tokenPool)
    xtz_pool                    = int(remove_liquidity.storage.xtzPool)
    lqt_total                   = int(remove_liquidity.storage.lqtTotal)
    token_address               = remove_liquidity.storage.tokenAddress
    lqt_address                 = remove_liquidity.storage.lqtAddress

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
        type                = models.DexType.REMOVE_LIQUIDITY,
        token_pool          = token_pool,
        xtz_pool            = xtz_pool,
        lqt_total           = lqt_total,
        xtz_token_price     = xtz_token_price,
        token_xtz_price     = token_xtz_price
    )
    await liquidity_baking_history_data.save()
