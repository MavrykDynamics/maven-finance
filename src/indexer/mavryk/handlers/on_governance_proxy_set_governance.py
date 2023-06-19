from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_governance
from mavryk.types.governance_proxy.parameter.set_governance import SetGovernanceParameter
from dipdup.models import Transaction
from mavryk.types.governance_proxy.storage import GovernanceProxyStorage
import mavryk.models as models

async def on_governance_proxy_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, GovernanceProxyStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.GovernanceProxy, set_governance)

    except BaseException as e:
         await save_error_report(e)

