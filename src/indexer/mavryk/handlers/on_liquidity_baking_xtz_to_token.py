from mavryk.utils.error_reporting import save_error_report

from mavryk.types.tzbtc.parameter.transfer import TransferParameter
from mavryk.types.tzbtc.storage import TzbtcStorage
from dipdup.context import HandlerContext
from mavryk.types.liquidity_baking.parameter.xtz_to_token import XtzToTokenParameter
from dipdup.models import Transaction
from mavryk.types.liquidity_baking.storage import LiquidityBakingStorage
import mavryk.models as models

async def on_liquidity_baking_xtz_to_token(
    ctx: HandlerContext,
    xtz_to_token: Transaction[XtzToTokenParameter, LiquidityBakingStorage],
    transfer: Transaction[TransferParameter, TzbtcStorage],
) -> None:

    try:    
        # Get operation data
        trader_address              = xtz_to_token.data.sender_address
        liquidity_baking_address    = xtz_to_token.data.target_address
        timestamp                   = xtz_to_token.data.timestamp
        level                       = xtz_to_token.data.level
        token_pool                  = int(xtz_to_token.storage.tokenPool)
        xtz_pool                    = int(xtz_to_token.storage.xtzPool)
        lqt_total                   = int(xtz_to_token.storage.lqtTotal)
        token_address               = xtz_to_token.storage.tokenAddress
        lqt_address                 = xtz_to_token.storage.lqtAddress
        min_token_quantity          = float(xtz_to_token.parameter.minTokensBought)
        token_quantity              = float(transfer.parameter.value)
        xtz_quantity                = float(xtz_to_token.data.amount)
    
        # Create / Update record
        liquidity_baking, _ = await models.LiquidityBaking.get_or_create(
            network = ctx.datasource.network,
            address = liquidity_baking_address
        )
    
        min_token_quantity_decimals     = min_token_quantity / (10**liquidity_baking.token_decimals)
        token_quantity_decimals         = token_quantity / (10**liquidity_baking.token_decimals)
        xtz_quantity_decimals           = xtz_quantity / (10**liquidity_baking.xtz_decimals)
        xtz_pool_decimals               = xtz_pool / (10**liquidity_baking.xtz_decimals)
        token_pool_decimals             = token_pool / (10**liquidity_baking.token_decimals)
        slippage                        = 0
        price                           = 0
        if token_quantity_decimals > 0:
            slippage    = (1 - (min_token_quantity_decimals / token_quantity_decimals))
            price       = xtz_quantity_decimals / token_quantity_decimals
        else:
            price       = xtz_pool_decimals / token_pool_decimals
        share_price                         = (xtz_pool_decimals + (xtz_pool_decimals / token_pool_decimals) * token_pool_decimals) / lqt_total
        liquidity_baking.token_pool         = token_pool
        liquidity_baking.xtz_pool           = xtz_pool
        liquidity_baking.lqt_total          = lqt_total
        liquidity_baking.token_address      = token_address
        liquidity_baking.lqt_address        = lqt_address
        liquidity_baking.share_price        = share_price
        await liquidity_baking.save()
    
        trader                          = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=trader_address)
    
        liquidity_baking_history_data   = models.LiquidityBakingHistoryData(
            timestamp           = timestamp,
            level               = level,
            trader              = trader,
            liquidity_baking    = liquidity_baking,
            type                = models.DexType.XTZ_TO_TOKEN,
            token_price         = price,
            lqt_qty             = 0,
            xtz_qty             = xtz_quantity,
            token_qty           = token_quantity,
            slippage            = slippage,
            token_pool          = token_pool,
            xtz_pool            = xtz_pool,
            lqt_total           = lqt_total,
        )
        await liquidity_baking_history_data.save()

    except BaseException as e:
         await save_error_report(e)

