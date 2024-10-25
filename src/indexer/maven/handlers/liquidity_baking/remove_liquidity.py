from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from maven.types.liquidity_baking.tezos_parameters.remove_liquidity import RemoveLiquidityParameter
from maven.types.liquidity_baking.tezos_storage import LiquidityBakingStorage
from maven.types.sirius.tezos_storage import SiriusStorage
from maven.types.tzbtc.tezos_storage import TzbtcStorage
from maven.types.tzbtc.tezos_parameters.transfer import TransferParameter
from maven.types.sirius.tezos_parameters.mint_or_burn import MintOrBurnParameter
from dipdup.models.tezos_tzkt import TzktTransaction, TzktOperationData
import maven.models as models

async def remove_liquidity(
    ctx: HandlerContext,
    remove_liquidity: TzktTransaction[RemoveLiquidityParameter, LiquidityBakingStorage],
    mint_or_burn: TzktTransaction[MintOrBurnParameter, SiriusStorage],
    transfer: TzktTransaction[TransferParameter, TzbtcStorage],
    transaction_3: TzktOperationData,
) -> None:

    try:
        # Get operation data
        liquidity_baking_address    = remove_liquidity.data.target_address
        timestamp                   = remove_liquidity.data.timestamp
        level                       = remove_liquidity.data.level
        trader_address              = remove_liquidity.data.sender_address
        token_pool                  = int(remove_liquidity.storage.tokenPool)
        xtz_pool                    = int(remove_liquidity.storage.xtzPool)
        lqt_total                   = int(remove_liquidity.storage.lqtTotal)
        token_address               = remove_liquidity.storage.tokenAddress
        lqt_address                 = remove_liquidity.storage.lqtAddress
        lqt_burned                  = float(remove_liquidity.parameter.lqtBurned)
        lqt_balance                 = 0
        if trader_address in mint_or_burn.storage.tokens:
            lqt_balance = float(mint_or_burn.storage.tokens[trader_address])
        xtz_qty                     = float(transaction_3.amount)
        token_qty                   = float(transfer.parameter.value)
    
        # Create / Update record
        liquidity_baking, _ = await models.LiquidityBaking.get_or_create(
            network = ctx.datasource.name.replace('mvkt_',''),
            address = liquidity_baking_address
        )
    
        xtz_pool_decimals       = xtz_pool / (10**liquidity_baking.xtz_decimals)
        token_pool_decimals     = token_pool / (10**liquidity_baking.token_decimals)
        xtz_qty_decimals        = xtz_qty / (10**liquidity_baking.xtz_decimals)
        token_qty_decimals      = token_qty / (10**liquidity_baking.token_decimals)
        price                   = 0
        if token_pool_decimals > 0:
            price   = xtz_pool_decimals / token_pool_decimals
        
        trader                  = await models.maven_user_cache.get(network=ctx.datasource.name.replace('mvkt_',''), address=trader_address)
    
        share_price             = 0
        if lqt_burned > 0:
            share_price = (xtz_qty_decimals + price * token_qty_decimals) / lqt_burned
        position, _             = await models.LiquidityBakingPosition.get_or_create(
            liquidity_baking    = liquidity_baking,
            trader              = trader
        )
        position.realized_pl    += lqt_burned * (share_price - position.avg_share_price)
        position.realized_pl    = round(position.realized_pl, liquidity_baking.xtz_decimals)
        position.shares_qty     = lqt_balance
        await position.save()
    
        liquidity_baking.token_pool         = token_pool
        liquidity_baking.xtz_pool           = xtz_pool
        liquidity_baking.lqt_total          = lqt_total
        liquidity_baking.token_address      = token_address
        liquidity_baking.lqt_address        = lqt_address
        liquidity_baking.share_price        = share_price
        await liquidity_baking.save()
    
        liquidity_baking_history_data   = models.LiquidityBakingHistoryData(
            timestamp           = timestamp,
            level               = level,
            trader              = trader,
            liquidity_baking    = liquidity_baking,
            type                = models.DexType.REMOVE_LIQUIDITY,
            token_price         = price,
            lqt_qty             = lqt_burned,
            xtz_qty             = xtz_qty,
            token_qty           = token_qty,
            token_pool          = token_pool,
            xtz_pool            = xtz_pool,
            lqt_total           = lqt_total
        )
        await liquidity_baking_history_data.save()

    except BaseException as e:
        await save_error_report(e)

