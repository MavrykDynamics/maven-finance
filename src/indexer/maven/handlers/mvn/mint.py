from maven.utils.error_reporting import save_error_report

from maven.types.mvn_token.tezos_storage import MvnTokenStorage
from dipdup.context import HandlerContext
from maven.types.mvn_token.tezos_parameters.mint import MintParameter
from dipdup.models.tezos import TezosTransaction
from maven import models as models

async def mint(
    ctx: HandlerContext,
    mint: TezosTransaction[MintParameter, MvnTokenStorage],
) -> None:

    try:
        # Get operation values
        mint_address        = mint.parameter.address
        mvn_token_address   = mint.data.target_address
        timestamp           = mint.data.timestamp
        level               = int(mint.data.level)
        new_user_balance    = mint.storage.ledger[mint_address]
        minted_amount       = float(mint.parameter.nat)
        total_supply        = float(mint.storage.totalSupply)

        # Get mint account
        user                = await models.get_user(network='atlasnet', address=mint_address)
        user.mvn_balance    = new_user_balance
        await user.save()
    
        # Create record
        token               = await models.Token.get(
            network         = 'atlasnet',
            token_address   = mvn_token_address,
            token_id        = 0
        )
        mvn_token               = await models.MVNToken.get(network='atlasnet', address= mvn_token_address, token=token)
        mvn_token.total_supply  = total_supply
        await mvn_token.save()
        
        mint_burn_history_data  = models.MVNTokenMintOrBurnHistoryData(
            mvn_token           = mvn_token,
            level               = level,
            timestamp           = timestamp,
            user                = user,
            type                = models.MintOrBurnType.MINT,
            amount              = minted_amount,
            mvn_total_supply    = total_supply
        )
        await mint_burn_history_data.save()

    except BaseException as e:
        await save_error_report(e)

