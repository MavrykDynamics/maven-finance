from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_governance_satellite_action
from mavryk.types.governance_satellite.tezos_parameters.restore_satellite import RestoreSatelliteParameter
from dipdup.context import HandlerContext
from mavryk.types.governance_satellite.tezos_storage import GovernanceSatelliteStorage
from dipdup.models.tezos_tzkt import TzktTransaction

async def restore_satellite(
    ctx: HandlerContext,
    restore_satellite: TzktTransaction[RestoreSatelliteParameter, GovernanceSatelliteStorage],
) -> None:

    try:
        # Get operation info
        await persist_governance_satellite_action(ctx, restore_satellite)

    except BaseException as e:
        await save_error_report(e)

