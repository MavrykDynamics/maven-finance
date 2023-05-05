from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.utils.persisters import persist_governance
from mavryk.types.token_sale.parameter.set_governance import SetGovernanceParameter
from mavryk.types.token_sale.storage import TokenSaleStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_token_sale_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, TokenSaleStorage],
) -> None:

    try:    
        # Get operation info
        target_contract = set_governance.data.target_address
        contract        = await models.TokenSale.get(address = target_contract)
    
        # Persist new admin
        await persist_governance(set_governance, contract)

    except BaseException as e:
         await save_error_report(e)

