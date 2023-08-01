from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.utils.persisters import persist_governance
from mavryk.types.emergency_governance.tezos_parameters.set_governance import SetGovernanceParameter
from mavryk.types.emergency_governance.tezos_storage import EmergencyGovernanceStorage
import mavryk.models as models

async def set_governance(
    ctx: HandlerContext,
    set_governance: TzktTransaction[SetGovernanceParameter, EmergencyGovernanceStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.EmergencyGovernance, set_governance)

    except BaseException as e:
        await save_error_report(e)

