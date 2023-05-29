from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_admin
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.farm_factory.parameter.set_admin import SetAdminParameter
import mavryk.models as models

async def on_farm_factory_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, FarmFactoryStorage],
) -> None:

    try:    
        # Get operation info
        target_contract = set_admin.data.target_address
        contract        = await models.FarmFactory.get(network=ctx.datasource.network, address = target_contract)
    
        # Persist new admin
        await persist_admin(set_admin, contract)
    except BaseException as e:
         await save_error_report(e)

