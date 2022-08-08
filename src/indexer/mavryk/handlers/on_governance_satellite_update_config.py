
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from mavryk.types.governance_satellite.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configApprovalPercentage, UpdateConfigActionItem1 as configMaxActionsPerSatellite, UpdateConfigActionItem2 as configPurposeMaxLength, UpdateConfigActionItem3 as configSatelliteDurationInDays
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_governance_satellite_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, GovernanceSatelliteStorage],
) -> None:

    # Get operation values
    satellite_address       = update_config.data.target_address
    updated_value           = int(update_config.parameter.updateConfigNewValue)
    update_config_action    = type(update_config.parameter.updateConfigAction)

    # Update contract
    governance_satellite = await models.GovernanceSatellite.get(
        address = satellite_address
    )
    if update_config_action == configApprovalPercentage:
        governance_satellite.gov_sat_approval_percentage    = updated_value
    elif update_config_action == configMaxActionsPerSatellite:
        governance_satellite.max_actions_per_satellite      = updated_value
    elif update_config_action == configPurposeMaxLength:
        governance_satellite.gov_purpose_max_length         = updated_value
    elif update_config_action == configSatelliteDurationInDays:
        governance_satellite.gov_sat_duration_in_days       = updated_value

    await governance_satellite.save()
