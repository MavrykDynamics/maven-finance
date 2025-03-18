from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_governance_satellite_action
from maven.types.governance_satellite.tezos_storage import GovernanceSatelliteStorage
from dipdup.models.tezos import TezosTransaction
from maven.types.governance_satellite.tezos_parameters.ban_satellite import BanSatelliteParameter
from dipdup.context import HandlerContext

async def ban_satellite(
    ctx: HandlerContext,
    ban_satellite: TezosTransaction[BanSatelliteParameter, GovernanceSatelliteStorage],
) -> None:

    try:
        # Get operation info
        await persist_governance_satellite_action(ctx, ban_satellite)

    except BaseException as e:
        await save_error_report(e)

