from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_governance
from maven.types.governance_satellite.tezos_storage import GovernanceSatelliteStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.governance_satellite.tezos_parameters.set_governance import SetGovernanceParameter
from dipdup.context import HandlerContext
import maven.models as models

async def set_governance(
    ctx: HandlerContext,
    set_governance: TzktTransaction[SetGovernanceParameter, GovernanceSatelliteStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.GovernanceSatellite, set_governance)

    except BaseException as e:
        await save_error_report(e)

