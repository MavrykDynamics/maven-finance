from mavryk.utils.error_reporting import save_error_report

from mavryk.types.governance_satellite.tezos_storage import GovernanceSatelliteStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.governance_satellite.tezos_parameters.drop_action import DropActionParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def drop_action(
    ctx: HandlerContext,
    drop_action: TzktTransaction[DropActionParameter, GovernanceSatelliteStorage],
) -> None:

    try:
        # Get operation info
        governance_satellite_address    = drop_action.data.target_address
        action_storage                  = drop_action.storage.governanceSatelliteActionLedger[drop_action.parameter.__root__]
        action_id                       = int(drop_action.parameter.__root__)
        status                          = action_storage.status
        status_type                     = models.GovernanceActionStatus.ACTIVE
        status_timestamp                = None
        if not status:
            status_type         = models.GovernanceActionStatus.DROPPED
            status_timestamp    = drop_action.data.timestamp
    
        # Create or update record
        governance_satellite            = await models.GovernanceSatellite.get(network=ctx.datasource.name.replace('tzkt_',''), address= governance_satellite_address)
        await models.GovernanceSatelliteAction.filter(
            internal_id             = action_id,
            governance_satellite    = governance_satellite
        ).update(
            status              = status_type,
            dropped_datetime    = status_timestamp
        )

    except BaseException as e:
        await save_error_report(e)

