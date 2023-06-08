from mavryk.utils.error_reporting import save_error_report

from mavryk.types.mvk_token.storage import MvkTokenStorage
from dipdup.context import HandlerContext
from mavryk.types.mvk_token.parameter.mint import MintParameter
from dipdup.models import Transaction
import mavryk.models as models

async def on_mvk_mint(
    ctx: HandlerContext,
    mint: Transaction[MintParameter, MvkTokenStorage],
) -> None:

    try:
        # Get operation values
        mintAddress         = mint.parameter.address
        mvk_token_address   = mint.data.target_address
        timestamp           = mint.data.timestamp
        level               = int(mint.data.level)
        new_user_balance    = mint.storage.ledger[mintAddress]
        minted_amount       = float(mint.parameter.nat)
        total_supply        = float(mint.storage.totalSupply)
    
        # Get mint account
        user                = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=mintAddress)
        user.mvk_balance = new_user_balance
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
        
        mint_history_data       = models.MVKTokenMintHistoryData(
            mvk_token           = mvk_token,
            level               = level,
            timestamp           = timestamp,
            user                = user,
            minted_amount       = minted_amount,
            mvk_total_supply    = total_supply
        )
        await mint_history_data.save()
    except BaseException as e:
         await save_error_report(e)

