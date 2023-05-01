from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.types.token_sale.parameter.close_sale import CloseSaleParameter
from mavryk.types.token_sale.storage import TokenSaleStorage
from dipdup.context import HandlerContext
import mavryk.models as models
from dateutil import parser

async def on_token_sale_close_sale(
    ctx: HandlerContext,
    close_sale: Transaction[CloseSaleParameter, TokenSaleStorage],
) -> None:

    try:
        # Get operation values
        token_sale_address      = close_sale.data.target_address
        started                 = close_sale.storage.tokenSaleHasStarted
        ended                   = close_sale.storage.tokenSaleHasEnded
        paused                  = close_sale.storage.tokenSalePaused
        end_timestamp           = parser.parse(close_sale.storage.tokenSaleEndTimestamp)
        end_block_level         = int(close_sale.storage.tokenSaleEndBlockLevel)
    
        # Update record
        token_sale              = await models.TokenSale.get(
            address = token_sale_address
        )
        token_sale.started          = started
        token_sale.ended            = ended
        token_sale.paused           = paused
        token_sale.end_timestamp    = end_timestamp
        token_sale.end_block_level  = end_block_level
        await token_sale.save()

    except BaseException as e:
         await save_error_report(e)

