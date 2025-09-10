from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_governance
from maven.types.governance_satellite.tezos_storage import GovernanceSatelliteStorage
from dipdup.models.tezos import TezosTransaction
from maven.types.governance_satellite.tezos_parameters.set_governance import SetGovernanceParameter
from dipdup.context import HandlerContext
from maven import models as models

async def set_governance(
    ctx: HandlerContext,
    set_governance: TezosTransaction[SetGovernanceParameter, GovernanceSatelliteStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.GovernanceSatellite, set_governance)

    except BaseException as e:
        await save_error_report(e)

