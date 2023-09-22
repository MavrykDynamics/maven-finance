from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_governance
from mavryk.types.governance_proxy.tezos_parameters.set_governance import SetGovernanceParameter
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.governance_proxy.tezos_storage import GovernanceProxyStorage
import mavryk.models as models

async def set_governance(
    ctx: HandlerContext,
    set_governance: TzktTransaction[SetGovernanceParameter, GovernanceProxyStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.GovernanceProxy, set_governance)

    except BaseException as e:
        await save_error_report(e)

