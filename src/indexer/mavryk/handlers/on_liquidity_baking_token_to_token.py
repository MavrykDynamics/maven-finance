from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.types.liquidity_baking.storage import LiquidityBakingStorage
from dipdup.context import HandlerContext
from mavryk.types.liquidity_baking.parameter.token_to_token import TokenToTokenParameter
import mavryk.models as models

async def on_liquidity_baking_token_to_token(
    ctx: HandlerContext,
    token_to_token: Transaction[TokenToTokenParameter, LiquidityBakingStorage],
) -> None:

    try:    ...
        # TODO: Refactor when needed
        # breakpoint()
        
        # # Get operation data
        # trader_address              = token_to_token.data.sender_address
        # liquidity_baking_address    = token_to_token.data.target_address
        # timestamp                   = token_to_token.data.timestamp
        # level                       = token_to_token.data.level
        # token_pool                  = int(token_to_token.storage.tokenPool)
        # xtz_pool                    = int(token_to_token.storage.xtzPool)
        # lqt_total                   = int(token_to_token.storage.lqtTotal)
        # token_address               = token_to_token.storage.tokenAddress
        # lqt_address                 = token_to_token.storage.lqtAddress
    
        # # Create / Update record
        # liquidity_baking, _ = await models.LiquidityBaking.get_or_create(
        #     address = liquidity_baking_address
        # )
    
        # xtz_pool_decimals                 = xtz_pool / (10**liquidity_baking.xtz_decimals)
        # token_pool_decimals               = token_pool / (10**liquidity_baking.token_decimals)
        # price                             = xtz_pool_decimals / token_pool_decimals
        # xtz_pool_decimals                 = xtz_pool / (10**liquidity_baking.xtz_decimals)
        # token_pool_decimals               = token_pool / (10**liquidity_baking.token_decimals)
        # share_price                       = (xtz_pool_decimals + (token_pool_decimals / xtz_pool_decimals) * token_pool_decimals) / lqt_total
    
        # liquidity_baking.token_pool       = token_pool
        # liquidity_baking.xtz_pool         = xtz_pool
        # liquidity_baking.lqt_total        = lqt_total
        # liquidity_baking.token_address    = token_address
        # liquidity_baking.lqt_address      = lqt_address
        # liquidity_baking.share_price      = share_price
        # await liquidity_baking.save()
    
        # trader                            = await models.mavryk_user_cache.get(address=trader_address)
    
        # liquidity_baking_history_data   = models.LiquidityBakingHistoryData(
        #     timestamp           = timestamp,
        #     level               = level,
        #     liquidity_baking    = liquidity_baking,
        #     type                = models.DexType.TOKEN_TO_TOKEN,
        #     price               = price,
        #     token_pool          = token_pool,
        #     xtz_pool            = xtz_pool,
        # )
        # await liquidity_baking_history_data.save()

    except BaseException as e:
         await save_error_report(e)

