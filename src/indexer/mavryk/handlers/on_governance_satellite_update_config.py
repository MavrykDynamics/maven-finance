from mavryk.utils.error_reporting import save_error_report

from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from mavryk.types.governance_satellite.parameter.update_config import UpdateConfigParameter
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_governance_satellite_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, GovernanceSatelliteStorage],
) -> None:

    try:
        # Get operation values
        satellite_address       = update_config.data.target_address
        timestamp               = update_config.data.timestamp
    
        # Update contract
        await models.GovernanceSatellite.filter(
            network = ctx.datasource.network,
            address = satellite_address
        ).update(
            last_updated_at                 = timestamp,
            gov_sat_approval_percentage     = update_config.storage.config.governanceSatelliteApprovalPercentage,
            gov_sat_duration_in_days        = update_config.storage.config.governanceSatelliteDurationInDays,
            gov_purpose_max_length          = update_config.storage.config.governancePurposeMaxLength,
            max_actions_per_satellite       = update_config.storage.config.maxActionsPerSatellite
        )

    except BaseException as e:
         await save_error_report(e)

