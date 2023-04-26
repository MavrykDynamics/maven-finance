from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_admin
from mavryk.types.aggregator_factory.parameter.set_admin import SetAdminParameter
from dipdup.models import Transaction
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_factory_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, AggregatorFactoryStorage],
) -> None:

    try:    
        # Get operation info
        target_contract = set_admin.data.target_address
        contract        = await models.AggregatorFactory.get(address = target_contract)
    
        # Persist new admin
        await persist_admin(set_admin, contract)

    except BaseException:
         await save_error_report()

