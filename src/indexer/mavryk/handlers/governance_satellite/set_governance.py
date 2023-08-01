from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_governance
from mavryk.types.governance_satellite.tezos_storage import GovernanceSatelliteStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.governance_satellite.tezos_parameters.set_governance import SetGovernanceParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def set_governance(
    ctx: HandlerContext,
    set_governance: TzktTransaction[SetGovernanceParameter, GovernanceSatelliteStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.GovernanceSatellite, set_governance)

    except BaseException as e:
        await save_error_report(e)

