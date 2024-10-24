from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.utils.persisters import persist_governance
from maven.types.governance_proxy.tezos_parameters.set_governance import SetGovernanceParameter
from dipdup.models.tezos import TezosTransaction
from maven.types.governance_proxy.tezos_storage import GovernanceProxyStorage
import maven.models as models

async def set_governance(
    ctx: HandlerContext,
    set_governance: TezosTransaction[SetGovernanceParameter, GovernanceProxyStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.GovernanceProxy, set_governance)

    except BaseException as e:
        await save_error_report(e)

