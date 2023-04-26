from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_governance
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury_factory.parameter.set_governance import SetGovernanceParameter
import mavryk.models as models

async def on_treasury_factory_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, TreasuryFactoryStorage],
) -> None:

    try:    
        # Get operation info
        target_contract = set_governance.data.target_address
        contract        = await models.TreasuryFactory.get(address = target_contract)
    
        # Persist new admin
        await persist_governance(set_governance, contract)
    except BaseException:
         await save_error_report()

