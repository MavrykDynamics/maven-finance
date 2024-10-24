from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.treasury.tezos_parameters.default import DefaultParameter
from maven.types.treasury.tezos_storage import TreasuryStorage
from maven import models as models

async def default(
    ctx: HandlerContext,
    default: TezosTransaction[DefaultParameter, TreasuryStorage],
) -> None:
    try:    
        # Get operation info
        treasury_address    = default.data.target_address
        token_address       = "mv2ZZZZZZZZZZZZZZZZZZZZZZZZZZZDXMF2d"
        token_standard      = "mav"
        amount              = float(default.data.amount)
        metadata            = {
          "name": "Mavryk",
          "symbol": "MVRK",
          "decimals": "6",
          "icon": "ipfs://QmbHaFX2gyFEzdwp54vqtf7McL74BvT7r4pw6UVyfEdKhu",
          "thumbnailUri": "ipfs://QmbHaFX2gyFEzdwp54vqtf7McL74BvT7r4pw6UVyfEdKhu",
        }

        # Create the MVRK token record
        token, _            = await models.Token.get_or_create(
            token_address       = token_address,
            network             = 'atlasnet'
        )
        token.token_standard    = token_standard
        token.metadata          = metadata
        await token.save()

        # Update records
        treasury            = await models.Treasury.get(
            network         = 'atlasnet',
            address         = treasury_address
        )
        treasury_balance, _ = await models.TreasuryBalance.get_or_create(
            treasury        = treasury,
            token           = token,
            whitelisted     = True
        )
        treasury_balance.balance        += amount
        await treasury_balance.save()

    except BaseException as e:
        await save_error_report(e)

