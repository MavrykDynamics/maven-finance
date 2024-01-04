from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.utils.persisters import persist_governance
from maven.types.delegation.tezos_storage import DelegationStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.delegation.tezos_parameters.set_governance import SetGovernanceParameter
import maven.models as models

async def set_governance(
    ctx: HandlerContext,
    set_governance: TzktTransaction[SetGovernanceParameter, DelegationStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.Delegation, set_governance)

    except BaseException as e:
        await save_error_report(e)

