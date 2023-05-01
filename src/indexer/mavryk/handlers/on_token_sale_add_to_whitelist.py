from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.types.token_sale.storage import TokenSaleStorage
from dipdup.context import HandlerContext
from mavryk.types.token_sale.parameter.add_to_whitelist import AddToWhitelistParameter
import mavryk.models as models

async def on_token_sale_add_to_whitelist(
    ctx: HandlerContext,
    add_to_whitelist: Transaction[AddToWhitelistParameter, TokenSaleStorage],
) -> None:

    try:
        # Get operation values
        token_sale_address      = add_to_whitelist.data.target_address
        whitelisted_addresses   = add_to_whitelist.parameter.__root__
    
        # Create record
        token_sale              = await models.TokenSale.get(
            address = token_sale_address
        )
        for user_address in whitelisted_addresses:
            user                = await models.mavryk_user_cache.get(address=user_address)
            whitelisted_user, _ = await models.TokenSaleWhitelistedUser.get_or_create(
                token_sale          = token_sale,
                whitelisted_user    = user
            )
            await whitelisted_user.save()

    except BaseException as e:
         await save_error_report(e)

