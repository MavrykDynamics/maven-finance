from mavryk.utils.error_reporting import save_error_report
from mavryk.utils.persisters import persist_admin
from mavryk.types.governance_proxy.parameter.set_admin import SetAdminParameter
from dipdup.context import HandlerContext
from mavryk.types.governance_proxy.storage import GovernanceProxyStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_governance_proxy_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, GovernanceProxyStorage],
) -> None:

    try:    
        # Get operation info
        target_contract = set_admin.data.target_address
        contract        = await models.GovernanceProxy.get(address = target_contract)
    
        # Persist new admin
        await persist_admin(set_admin, contract)

    except BaseException as e:
         await save_error_report(e)

