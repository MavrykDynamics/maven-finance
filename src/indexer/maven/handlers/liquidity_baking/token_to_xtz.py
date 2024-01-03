from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction, TzktOperationData
from maven.types.liquidity_baking.tezos_parameters.token_to_xtz import TokenToXtzParameter
from maven.types.liquidity_baking.tezos_storage import LiquidityBakingStorage
from maven.types.tzbtc.tezos_parameters.transfer import TransferParameter
from maven.types.tzbtc.tezos_storage import TzbtcStorage
import maven.models as models

async def token_to_xtz(
    ctx: HandlerContext,
    token_to_xtz: TzktTransaction[TokenToXtzParameter, LiquidityBakingStorage],
    transfer: TzktTransaction[TransferParameter, TzbtcStorage],
    transaction_2: TzktOperationData,
    transaction_3: TzktOperationData,
) -> None:

    try:    
        # Get operation data
        trader_address              = token_to_xtz.data.sender_address
        liquidity_baking_address    = token_to_xtz.data.target_address
        timestamp                   = token_to_xtz.data.timestamp
        level                       = token_to_xtz.data.level
        token_pool                  = int(token_to_xtz.storage.tokenPool)
        xtz_pool                    = int(token_to_xtz.storage.xtzPool)
        lqt_total                   = int(token_to_xtz.storage.lqtTotal)
        token_address               = token_to_xtz.storage.tokenAddress
        lqt_address                 = token_to_xtz.storage.lqtAddress
        min_xtz_quantity            = float(token_to_xtz.parameter.minXtzBought)
        token_quantity              = float(transfer.parameter.value)
        xtz_quantity                = float(transaction_2.amount) + float(transaction_3.amount)
    
        # Create / Update record
        liquidity_baking, _ = await models.LiquidityBaking.get_or_create(
            network = ctx.datasource.name.replace('tzkt_',''),
            address = liquidity_baking_address
        )
    
        min_xtz_quantity_decimals       = min_xtz_quantity / (10**liquidity_baking.xtz_decimals)
        token_quantity_decimals         = token_quantity / (10**liquidity_baking.token_decimals)
        xtz_quantity_decimals           = xtz_quantity / (10**liquidity_baking.xtz_decimals)
        xtz_pool_decimals               = xtz_pool / (10**liquidity_baking.xtz_decimals)
        token_pool_decimals             = token_pool / (10**liquidity_baking.token_decimals)
        slippage                        = 0
        price                           = 0
        if xtz_quantity_decimals > 0:
            slippage    = (1 - (min_xtz_quantity_decimals / xtz_quantity_decimals))
        if token_quantity_decimals > 0:
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
    
        trader                          = await models.maven_user_cache.get(network=ctx.datasource.name.replace('tzkt_',''), address=trader_address)
    
        liquidity_baking_history_data   = models.LiquidityBakingHistoryData(
            timestamp           = timestamp,
            level               = level,
            trader              = trader,
            liquidity_baking    = liquidity_baking,
            type                = models.DexType.TOKEN_TO_XTZ,
            token_price         = price,
            lqt_qty             = 0,
            xtz_qty             = xtz_quantity,
            token_qty           = token_quantity,
            slippage            = slippage,
            token_pool          = token_pool,
            xtz_pool            = xtz_pool,
            lqt_total           = lqt_total
        )
        await liquidity_baking_history_data.save()
    except BaseException as e:
        await save_error_report(e)

