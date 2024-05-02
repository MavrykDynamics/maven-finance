from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.treasury.tezos_parameters.default import DefaultParameter
from maven.types.treasury.tezos_storage import TreasuryStorage
from maven import models as models

async def default(
    ctx: HandlerContext,
    default: TzktTransaction[DefaultParameter, TreasuryStorage],
) -> None:
    try:    
        # Get operation info
        treasury_address    = default.data.target_address
        token_address       = "mv2ZZZZZZZZZZZZZZZZZZZZZZZZZZZDXMF2d"
        token_standard      = "mav"
        amount              = float(default.data.amount)
        metadata            = {
          "name": "Tezos",
          "symbol": "MVRK",
          "decimals": "6",
          "icon": "https://infura-ipfs.io/ipfs/QmdiScFymWzZ5qgVd47QN7RA2nrDDRZ1vTqDrC4LnJSqTW",
          "thumbnailUri": "https://infura-ipfs.io/ipfs/QmdiScFymWzZ5qgVd47QN7RA2nrDDRZ1vTqDrC4LnJSqTW",
        }

        # Create the MVRK token record
        token, _            = await models.Token.get_or_create(
            token_address       = token_address,
            network             = ctx.datasource.name.replace('mvkt_','')
        )
        token.token_standard    = token_standard
        token.metadata          = metadata
        await token.save()

        # Update records
        treasury            = await models.Treasury.get(
            network         = ctx.datasource.name.replace('mvkt_',''),
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

