from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.mvk_token.tezos_parameters.burn import BurnParameter
from mavryk.types.mvk_token.tezos_storage import MvkTokenStorage
from mavryk.utils.error_reporting import save_error_report
import mavryk.models as models

async def burn(
    ctx: HandlerContext,
    burn: TzktTransaction[BurnParameter, MvkTokenStorage],
) -> None:

    try:
        # Get operation values
        burn_address        = burn.data.sender_address
        mvk_token_address   = burn.data.target_address
        timestamp           = burn.data.timestamp
        level               = int(burn.data.level)
        new_user_balance    = burn.storage.ledger[burn_address]
        burned_amount       = float(burn.parameter.__root__)
        total_supply        = float(burn.storage.totalSupply)

        # Get mint account
        user                = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=burn_address)
        user.mvk_balance    = new_user_balance
        await user.save()
    
        # Create record
        token               = await models.Token.get(
            network         = ctx.datasource.network,
            token_address   = mvk_token_address,
            token_id        = 0
        )
        mvk_token               = await models.MVKToken.get(network=ctx.datasource.network, address= mvk_token_address, token=token)
        mvk_token.total_supply  = total_supply
        await mvk_token.save()
        
        mint_burn_history_data  = models.MVKTokenMintOrBurnHistoryData(
            mvk_token           = mvk_token,
            level               = level,
            timestamp           = timestamp,
            user                = user,
            type                = models.MintOrBurnType.BURN,
            amount              = burned_amount,
            mvk_total_supply    = total_supply
        )
        await mint_burn_history_data.save()

    except BaseException as e:
         await save_error_report(e)
