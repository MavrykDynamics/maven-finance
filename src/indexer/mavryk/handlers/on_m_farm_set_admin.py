from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_admin
from mavryk.types.m_farm.parameter.set_admin import SetAdminParameter
from mavryk.types.m_farm.storage import MFarmStorage
import mavryk.models as models

async def on_m_farm_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, MFarmStorage],
) -> None:

    try:    
        # Get operation info
        target_contract = set_admin.data.target_address
        contract        = await models.Farm.get(address = target_contract)
    
        # Persist new admin
        await persist_admin(set_admin, contract)

    except BaseException:
         await save_error_report()

