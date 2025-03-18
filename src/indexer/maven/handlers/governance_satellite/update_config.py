from maven.utils.error_reporting import save_error_report

from maven.types.governance_satellite.tezos_storage import GovernanceSatelliteStorage
from maven.types.governance_satellite.tezos_parameters.update_config import UpdateConfigParameter
from dipdup.models.tezos import TezosTransaction
from dipdup.context import HandlerContext
from maven import models as models

async def update_config(
    ctx: HandlerContext,
    update_config: TezosTransaction[UpdateConfigParameter, GovernanceSatelliteStorage],
) -> None:

    try:
        # Get operation values
        satellite_address       = update_config.data.target_address
        timestamp               = update_config.data.timestamp
    
        # Update contract
        await models.GovernanceSatellite.filter(
            network = 'atlasnet',
            address = satellite_address
        ).update(
            last_updated_at                 = timestamp,
            approval_percentage             = update_config.storage.config.approvalPercentage,
            sat_action_duration_in_days     = update_config.storage.config.satelliteActionDurationInDays,
            gov_purpose_max_length          = update_config.storage.config.governancePurposeMaxLength,
            max_actions_per_satellite       = update_config.storage.config.maxActionsPerSatellite
        )

    except BaseException as e:
        await save_error_report(e)

