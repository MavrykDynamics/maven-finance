
from mavryk.types.mvk_token.storage import MvkTokenStorage
from dipdup.context import HandlerContext
from mavryk.types.mvk_token.parameter.mint import MintParameter
from dipdup.models import Transaction
import mavryk.models as models

async def on_mvk_mint(
    ctx: HandlerContext,
    mint: Transaction[MintParameter, MvkTokenStorage],
) -> None:

    # Get operation values
    mintAddress         = mint.parameter.address
    mvk_token_address   = mint.data.target_address
    timestamp           = mint.data.timestamp
    level               = int(mint.data.level)
    new_user_balance    = mint.storage.ledger[mintAddress]
    minted_amount       = float(mint.parameter.nat)
    total_supply        = float(mint.storage.totalSupply)

    # Get mint account
    user                = await models.mavryk_user_cache.get(address=mintAddress)
    user.mvk_balance = new_user_balance
    await user.save()

    # Create record
    mvk_token               = await models.MVKToken.get(address = mvk_token_address)
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