from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.types.token_sale.storage import TokenSaleStorage
from dipdup.context import HandlerContext
from mavryk.types.token_sale.parameter.set_whitelist_timestamp import SetWhitelistTimestampParameter
import mavryk.models as models
from dateutil import parser

async def on_token_sale_set_whitelist_timestamp(
    ctx: HandlerContext,
    set_whitelist_timestamp: Transaction[SetWhitelistTimestampParameter, TokenSaleStorage],
) -> None:

    try:
        # Get operation values
        token_sale_address          = set_whitelist_timestamp.data.target_address
        whitelist_start_timestamp   = parser.parse(set_whitelist_timestamp.parameter.whitelistStartTimestamp)
        whitelist_end_timestamp     = parser.parse(set_whitelist_timestamp.parameter.whitelistEndTimestamp)
    
        # Update record
        token_sale          = await models.TokenSale.get(
            address = token_sale_address
        )
        token_sale.whitelist_start_timestamp    = whitelist_start_timestamp
        token_sale.whitelist_end_timestamp      = whitelist_end_timestamp
        await token_sale.save()

    except BaseException as e:
         await save_error_report(e)

