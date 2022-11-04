
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
    
    # Get operation data
    trader_address              = xtz_to_token.data.sender_address
    liquidity_baking_address    = xtz_to_token.data.target_address
    timestamp                   = xtz_to_token.data.timestamp
    level                       = xtz_to_token.data.level
    tzkt                        = ctx.get_tzkt_datasource('tzkt_mainnet')
    xtz_quotes                  = await tzkt.get_quotes(
        first_level=level,
        last_level=level
    )
    xtz_usd                     = float(xtz_quotes[0].usd)
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
        address = liquidity_baking_address
    )

    min_token_quantity_decimals     = min_token_quantity / (10**liquidity_baking.token_decimals)
    token_quantity_decimals         = token_quantity / (10**liquidity_baking.token_decimals)
    xtz_quantity_decimals           = xtz_quantity / (10**liquidity_baking.xtz_decimals)
    slippage                        = 0
    price                           = 0
    if token_quantity_decimals > 0:
        slippage    = (1 - (min_token_quantity_decimals / token_quantity_decimals))
        price       = xtz_quantity_decimals / token_quantity_decimals
    xtz_pool_decimals               = xtz_pool / (10**liquidity_baking.xtz_decimals)
    token_pool_decimals             = token_pool / (10**liquidity_baking.token_decimals)
    share_price                     = (xtz_pool_decimals + (token_pool_decimals / xtz_pool_decimals) * token_pool_decimals) / lqt_total
    
    liquidity_baking.token_pool         = token_pool
    liquidity_baking.xtz_pool           = xtz_pool
    liquidity_baking.lqt_total          = lqt_total
    liquidity_baking.token_address      = token_address
    liquidity_baking.lqt_address        = lqt_address
    liquidity_baking.share_price        = share_price
    liquidity_baking.share_price_usd    = share_price * xtz_usd
    await liquidity_baking.save()

    trader, _                       = await models.MavrykUser.get_or_create(
        address = trader_address
    )
    await trader.save()

    liquidity_baking_history_data   = models.LiquidityBakingHistoryData(
        timestamp           = timestamp,
        level               = level,
        trader              = trader,
        liquidity_baking    = liquidity_baking,
        type                = models.DexType.XTZ_TO_TOKEN,
        token_price         = price,
        token_price_usd     = price * xtz_usd,
        lqt_qty             = 0,
        xtz_qty             = xtz_quantity,
        token_qty           = token_quantity,
        slippage            = slippage,
        token_pool          = token_pool,
        xtz_pool            = xtz_pool,
        lqt_total           = lqt_total,
    )
    await liquidity_baking_history_data.save()
