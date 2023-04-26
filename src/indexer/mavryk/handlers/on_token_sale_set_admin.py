from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.utils.persisters import persist_admin
from mavryk.types.token_sale.parameter.set_admin import SetAdminParameter
from mavryk.types.token_sale.storage import TokenSaleStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_token_sale_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, TokenSaleStorage],
) -> None:

    try:    
        # Get operation info
        target_contract = set_admin.data.target_address
        contract        = await models.TokenSale.get(address = target_contract)
    
        # Persist new admin
        await persist_admin(set_admin, contract)

    except BaseException:
         await save_error_report()

