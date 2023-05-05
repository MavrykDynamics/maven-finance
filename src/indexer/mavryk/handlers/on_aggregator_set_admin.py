from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_admin
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from mavryk.types.aggregator.parameter.set_admin import SetAdminParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, AggregatorStorage],
) -> None:

    try:    
        # Get operation info
        target_contract = set_admin.data.target_address
        contract        = await models.Aggregator.get(address = target_contract)
    
        # Persist new admin
        await persist_admin(set_admin, contract)

    except BaseException as e:
         await save_error_report(e)

