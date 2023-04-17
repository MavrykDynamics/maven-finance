from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.mvk_token.parameter.burn import BurnParameter
from mavryk.types.mvk_token.storage import MvkTokenStorage
import mavryk.models as models

async def on_mvk_burn(
    ctx: HandlerContext,
    burn: Transaction[BurnParameter, MvkTokenStorage],
) -> None:

    # Get operation values
    burn_address        = burn.data.sender_address
    mvk_token_address   = burn.data.target_address
    timestamp           = burn.data.timestamp
    new_user_balance    = burn.storage.ledger[burn_address]
    burned_amount       = float(burn.parameter.__root__)
    total_supply        = float(burn.storage.totalSupply)

    # Get mint account
    user                = await models.mavryk_user_cache.get(address = burn_address)
    user.mvk_balance    = new_user_balance
    await user.save()

    # Create record
    mvk_token               = await models.MVKToken.get(address = mvk_token_address)
    mvk_token.total_supply  = total_supply
    await mvk_token.save()
    
    mint_burn_history_data  = models.MVKTokenMintOrBurnHistoryData(
        mvk_token           = mvk_token,
        timestamp           = timestamp,
        user                = user,
        type                = models.MintOrBurnType.BURN,
        amount              = burned_amount,
        mvk_total_supply    = total_supply
    )
    await mint_burn_history_data.save()
