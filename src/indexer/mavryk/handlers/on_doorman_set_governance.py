from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_governance
from mavryk.types.doorman.parameter.set_governance import SetGovernanceParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.doorman.storage import DoormanStorage
import mavryk.models as models

async def on_doorman_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, DoormanStorage],
) -> None:

    try:    
        # Get operation info
        target_contract = set_governance.data.target_address
        contract        = await models.Doorman.get(network=ctx.datasource.network, address= target_contract)
    
        # Persist new admin
        await persist_governance(ctx, set_governance, contract)
    except BaseException as e:
         await save_error_report(e)

