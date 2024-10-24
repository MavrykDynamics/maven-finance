from maven.utils.error_reporting import save_error_report

from maven.types.tzbtc.tezos_parameters.transfer import TransferParameter
from maven.types.liquidity_baking.tezos_storage import LiquidityBakingStorage
from maven.types.sirius.tezos_parameters.mint_or_burn import MintOrBurnParameter
from maven.types.sirius.tezos_storage import SiriusStorage
from dipdup.context import HandlerContext
from maven.types.tzbtc.tezos_storage import TzbtcStorage
from maven.types.liquidity_baking.tezos_parameters.add_liquidity import AddLiquidityParameter
from dipdup.models.tezos import TezosTransaction
import maven.models as models

async def add_liquidity(
    ctx: HandlerContext,
    add_liquidity: TezosTransaction[AddLiquidityParameter, LiquidityBakingStorage],
    transfer: TezosTransaction[TransferParameter, TzbtcStorage],
    mint_or_burn: TezosTransaction[MintOrBurnParameter, SiriusStorage],
) -> None:

    try:
        # Get operation data
        liquidity_baking_address    = add_liquidity.data.target_address
        timestamp                   = add_liquidity.data.timestamp
        level                       = add_liquidity.data.level
        trader_address              = add_liquidity.data.sender_address
        token_pool                  = int(add_liquidity.storage.tokenPool)
        xtz_pool                    = int(add_liquidity.storage.xtzPool)
        lqt_total                   = int(add_liquidity.storage.lqtTotal)
        token_address               = add_liquidity.storage.tokenAddress
        lqt_address                 = add_liquidity.storage.lqtAddress
        lqt_balance                 = 0
        min_lqt_minted              = float(add_liquidity.parameter.minLqtMinted)
        lqt_minted                  = float(mint_or_burn.parameter.quantity)
        xtz_qty                     = float(add_liquidity.data.amount)
        token_qty                   = float(transfer.parameter.value)
        if trader_address in mint_or_burn.storage.tokens:
            lqt_balance = float(mint_or_burn.storage.tokens[trader_address])
    
        # Create / Update record
        liquidity_baking, _ = await models.LiquidityBaking.get_or_create(
            network = 'atlasnet',
            address = liquidity_baking_address
        )
    
        xtz_pool_decimals       = xtz_pool / (10**liquidity_baking.xtz_decimals)
        token_pool_decimals     = token_pool / (10**liquidity_baking.token_decimals)
        slippage                = 0
        if lqt_minted > 0:
            slippage    = (1 - (min_lqt_minted / lqt_minted))
        xtz_qty_decimals        = xtz_qty / (10**liquidity_baking.xtz_decimals)
        token_qty_decimals      = token_qty / (10**liquidity_baking.token_decimals)
        price                   = 0
        if token_pool_decimals > 0:
            price   = xtz_pool_decimals / token_pool_decimals
        value                   = xtz_qty_decimals + price * token_qty_decimals
    
        trader                  = await models.maven_user_cache.get(network='atlasnet', address=trader_address)
    
        shares_qty              = lqt_balance
        position, _             = await models.LiquidityBakingPosition.get_or_create(
            liquidity_baking    = liquidity_baking,
            trader              = trader
        )
        share_price             = 0
        if (shares_qty - position.shares_qty) > 0:
            share_price = value / (shares_qty - position.shares_qty)
        if shares_qty > 0:
            position.avg_share_price        = (position.shares_qty * position.avg_share_price + value) / shares_qty
        position.shares_qty      = shares_qty
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
            type                = models.DexType.ADD_LIQUIDITY,
            token_price         = price,
            lqt_qty             = lqt_minted,
            xtz_qty             = xtz_qty,
            token_qty           = token_qty,
            slippage            = slippage,
            token_pool          = token_pool,
            xtz_pool            = xtz_pool,
            lqt_total           = lqt_total
        )
        await liquidity_baking_history_data.save()

    except BaseException as e:
        await save_error_report(e)

