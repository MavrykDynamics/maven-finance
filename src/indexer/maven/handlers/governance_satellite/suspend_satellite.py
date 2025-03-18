from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_governance_satellite_action
from maven.types.governance_satellite.tezos_storage import GovernanceSatelliteStorage
from dipdup.models.tezos import TezosTransaction
from maven.types.governance_satellite.tezos_parameters.suspend_satellite import SuspendSatelliteParameter
from dipdup.context import HandlerContext

async def suspend_satellite(
    ctx: HandlerContext,
    suspend_satellite: TezosTransaction[SuspendSatelliteParameter, GovernanceSatelliteStorage],
) -> None:

    try:
        # Get operation info
        await persist_governance_satellite_action(ctx, suspend_satellite)

    except BaseException as e:
        await save_error_report(e)

