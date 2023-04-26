from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_governance_satellite_action
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from dipdup.models import Transaction
from mavryk.types.governance_satellite.parameter.ban_satellite import BanSatelliteParameter
from dipdup.context import HandlerContext

async def on_governance_satellite_ban_satellite(
    ctx: HandlerContext,
    ban_satellite: Transaction[BanSatelliteParameter, GovernanceSatelliteStorage],
) -> None:

    try:
        # Get operation info
        await persist_governance_satellite_action(ctx, ban_satellite)

    except BaseException:
         await save_error_report()

