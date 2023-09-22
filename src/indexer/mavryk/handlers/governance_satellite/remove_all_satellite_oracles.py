from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_governance_satellite_action
from mavryk.types.governance_satellite.tezos_parameters.remove_all_satellite_oracles import RemoveAllSatelliteOraclesParameter
from mavryk.types.governance_satellite.tezos_storage import GovernanceSatelliteStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext

async def remove_all_satellite_oracles(
    ctx: HandlerContext,
    remove_all_satellite_oracles: TzktTransaction[RemoveAllSatelliteOraclesParameter, GovernanceSatelliteStorage],
) -> None:

    try:
        # Get operation info
        await persist_governance_satellite_action(ctx, remove_all_satellite_oracles)

    except BaseException as e:
        await save_error_report(e)

