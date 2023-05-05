from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_governance
from mavryk.types.treasury.parameter.set_governance import SetGovernanceParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury.storage import TreasuryStorage
import mavryk.models as models

async def on_treasury_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, TreasuryStorage],
) -> None:

    try:    
        # Get operation info
        target_contract = set_governance.data.target_address
        contract        = await models.Treasury.get(address = target_contract)
    
        # Persist new admin
        await persist_governance(set_governance, contract)

    except BaseException as e:
         await save_error_report(e)

