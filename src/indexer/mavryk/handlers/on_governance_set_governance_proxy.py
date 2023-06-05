from mavryk.utils.error_reporting import save_error_report

from mavryk.types.governance.parameter.set_governance_proxy import SetGovernanceProxyParameter
from dipdup.context import HandlerContext
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_governance_set_governance_proxy(
    ctx: HandlerContext,
    set_governance_proxy: Transaction[SetGovernanceProxyParameter, GovernanceStorage],
) -> None:

    try:
        # Get operation values
        governance_address          = set_governance_proxy.data.target_address
        governance_proxy_address    = set_governance_proxy.parameter.__root__
    
        # Update record
        governance                              = await models.Governance.get(address   = governance_address)
        governance.governance_proxy_address     = governance_proxy_address
        await governance.save()
    except BaseException as e:
         await save_error_report(e)

