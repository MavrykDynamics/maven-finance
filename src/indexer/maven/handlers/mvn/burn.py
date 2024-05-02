from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.mvn_token.tezos_parameters.burn import BurnParameter
from maven.types.mvn_token.tezos_storage import MvnTokenStorage
from maven.utils.error_reporting import save_error_report
import maven.models as models

async def burn(
    ctx: HandlerContext,
    burn: TzktTransaction[BurnParameter, MvnTokenStorage],
) -> None:

    try:
        # Get operation values
        burn_address        = burn.data.sender_address
        mvn_token_address   = burn.data.target_address
        timestamp           = burn.data.timestamp
        level               = int(burn.data.level)
        new_user_balance    = burn.storage.ledger[burn_address]
        burned_amount       = float(burn.parameter.__root__)
        total_supply        = float(burn.storage.totalSupply)

        # Get mint account
        user                = await models.maven_user_cache.get(network=ctx.datasource.name.replace('mvkt_',''), address=burn_address)
        user.mvn_balance    = new_user_balance
        await user.save()
    
        # Create record
        token               = await models.Token.get(
            network         = ctx.datasource.name.replace('mvkt_',''),
            token_address   = mvn_token_address,
            token_id        = 0
        )
        mvn_token               = await models.MVNToken.get(network=ctx.datasource.name.replace('mvkt_',''), address= mvn_token_address, token=token)
        mvn_token.total_supply  = total_supply
        await mvn_token.save()
        
        mint_burn_history_data  = models.MVNTokenMintOrBurnHistoryData(
            mvn_token           = mvn_token,
            level               = level,
            timestamp           = timestamp,
            user                = user,
            type                = models.MintOrBurnType.BURN,
            amount              = burned_amount,
            mvn_total_supply    = total_supply
        )
        await mint_burn_history_data.save()

    except BaseException as e:
         await save_error_report(e)
