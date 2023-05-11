from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury.parameter.default import DefaultParameter
from mavryk.types.treasury.storage import TreasuryStorage
from mavryk import models as models

async def on_treasury_default(
    ctx: HandlerContext,
    default: Transaction[DefaultParameter, TreasuryStorage],
) -> None:
    try:    
        # Get operation info
        treasury_address    = default.data.target_address
        token_address       = "XTZ"
        token_standard      = "tez"
        amount              = float(default.data.amount)
        metadata            = {
          "name": "Tezos",
          "symbol": "XTZ",
          "decimals": "6",
          "icon": "https://infura-ipfs.io/ipfs/QmdiScFymWzZ5qgVd47QN7RA2nrDDRZ1vTqDrC4LnJSqTW",
          "thumbnailUri": "https://infura-ipfs.io/ipfs/QmdiScFymWzZ5qgVd47QN7RA2nrDDRZ1vTqDrC4LnJSqTW",
        }

        # Create the XTZ token record
        token, _            = await models.Token.get_or_create(
            token_address       = token_address,
            metadata            = metadata,
            network             = ctx.datasource.network
        )
        await token.save()

        # Update records
        treasury            = await models.Treasury.get(
            address         = treasury_address
        )
        treasury_balance, _ = await models.TreasuryBalance.get_or_create(
            treasury        = treasury,
            token           = token,
        )
        treasury_balance.token_standard = token_standard
        treasury_balance.balance        += amount
        await treasury_balance.save()

    except BaseException as e:
         await save_error_report(e)

