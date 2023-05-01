from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.utils.persisters import persist_admin
from mavryk.types.treasury_factory.parameter.set_admin import SetAdminParameter
from dipdup.context import HandlerContext
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
import mavryk.models as models

async def on_treasury_factory_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, TreasuryFactoryStorage],
) -> None:

    try:    
        # Get operation info
        target_contract = set_admin.data.target_address
        contract        = await models.TreasuryFactory.get(address = target_contract)
    
        # Persist new admin
        await persist_admin(set_admin, contract)

    except BaseException as e:
         await save_error_report(e)

