from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.types.token_sale.parameter.pause_sale import PauseSaleParameter
from mavryk.types.token_sale.storage import TokenSaleStorage
from dipdup.context import HandlerContext
import mavryk.models as models
from dateutil import parser

async def on_token_sale_pause_sale(
    ctx: HandlerContext,
    pause_sale: Transaction[PauseSaleParameter, TokenSaleStorage],
) -> None:

    try:
        # Get operation values
        token_sale_address      = pause_sale.data.target_address
        started                 = pause_sale.storage.tokenSaleHasStarted
        ended                   = pause_sale.storage.tokenSaleHasEnded
        paused                  = pause_sale.storage.tokenSalePaused
        end_timestamp           = parser.parse(pause_sale.storage.tokenSaleEndTimestamp)
        end_block_level         = int(pause_sale.storage.tokenSaleEndBlockLevel)
    
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

