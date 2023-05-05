from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.types.token_sale.storage import TokenSaleStorage
from mavryk.types.token_sale.parameter.remove_from_whitelist import RemoveFromWhitelistParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_token_sale_remove_from_whitelist(
    ctx: HandlerContext,
    remove_from_whitelist: Transaction[RemoveFromWhitelistParameter, TokenSaleStorage],
) -> None:

    try:    
        # Get operation values
        token_sale_address  = remove_from_whitelist.data.target_address
        removed_addresses   = remove_from_whitelist.parameter.__root__
    
        # Create record
        token_sale              = await models.TokenSale.get(
            address = token_sale_address
        )
        for user_address in removed_addresses:
            user                = await models.mavryk_user_cache.get(address=user_address)
            whitelisted_user    = await models.TokenSaleWhitelistedUser.get_or_none(
                token_sale          = token_sale,
                whitelisted_user    = user
            )
            if whitelisted_user:
                await whitelisted_user.delete()

    except BaseException as e:
         await save_error_report(e)

