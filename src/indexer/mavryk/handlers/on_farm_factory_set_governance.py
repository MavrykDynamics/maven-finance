from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_governance
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.farm_factory.parameter.set_governance import SetGovernanceParameter
import mavryk.models as models

async def on_farm_factory_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, FarmFactoryStorage],
) -> None:

    try:    
        # Get operation info
        target_contract = set_governance.data.target_address
        contract        = await models.FarmFactory.get(address = target_contract)
    
        # Persist new admin
        await persist_governance(set_governance, contract)

    except BaseException:
         await save_error_report()

