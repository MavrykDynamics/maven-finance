from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.liquidity_baking.tezos_parameters.default import DefaultParameter
from maven.types.liquidity_baking.tezos_storage import LiquidityBakingStorage
import maven.models as models

async def default(
    ctx: HandlerContext,
    default: TezosTransaction[DefaultParameter, LiquidityBakingStorage],
) -> None:

    try:
        # Get operation data
        liquidity_baking_address    = default.data.target_address
        token_pool                  = int(default.storage.tokenPool)
        xtz_pool                    = int(default.storage.xtzPool)
        lqt_total                   = int(default.storage.lqtTotal)
    
        # Create / Update record
        liquidity_baking, _ = await models.LiquidityBaking.get_or_create(
            network = 'atlasnet',
            address = liquidity_baking_address
        )

        liquidity_baking.token_pool         = token_pool
        liquidity_baking.xtz_pool           = xtz_pool
        liquidity_baking.lqt_total          = lqt_total
        await liquidity_baking.save()

    except BaseException as e:
        await save_error_report(e)