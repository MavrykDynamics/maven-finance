from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.types.token_sale.parameter.start_sale import StartSaleParameter
from mavryk.types.token_sale.storage import TokenSaleStorage
from dipdup.context import HandlerContext
from dateutil import parser
import mavryk.models as models

async def on_token_sale_start_sale(
    ctx: HandlerContext,
    start_sale: Transaction[StartSaleParameter, TokenSaleStorage],
) -> None:

    try:
        # Get operation values
        token_sale_address      = start_sale.data.target_address
        started                 = start_sale.storage.tokenSaleHasStarted
        ended                   = start_sale.storage.tokenSaleHasEnded
        paused                  = start_sale.storage.tokenSalePaused
        end_timestamp           = parser.parse(start_sale.storage.tokenSaleEndTimestamp)
        end_block_level         = int(start_sale.storage.tokenSaleEndBlockLevel)
    
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

