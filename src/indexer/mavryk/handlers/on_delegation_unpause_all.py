from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.parameter.unpause_all import UnpauseAllParameter
from mavryk.types.delegation.storage import DelegationStorage
import mavryk.models as models

async def on_delegation_unpause_all(
    ctx: HandlerContext,
    unpause_all: Transaction[UnpauseAllParameter, DelegationStorage],
) -> None:

    try:
        # Get operation values
        delegation_address                  = unpause_all.data.target_address
        delegate_to_satellite_paused        = unpause_all.storage.breakGlassConfig.delegateToSatelliteIsPaused
        undelegate_from_satellite_paused    = unpause_all.storage.breakGlassConfig.undelegateFromSatelliteIsPaused
        register_as_satellite_paused        = unpause_all.storage.breakGlassConfig.registerAsSatelliteIsPaused
        unregister_as_satellite_paused      = unpause_all.storage.breakGlassConfig.unregisterAsSatelliteIsPaused
        update_satellite_record_paused      = unpause_all.storage.breakGlassConfig.updateSatelliteRecordIsPaused
        distribute_reward_paused            = unpause_all.storage.breakGlassConfig.distributeRewardIsPaused
    
        # Update contract
        await models.Delegation.filter(network=ctx.datasource.network, address=delegation_address).update(
            delegate_to_satellite_paused         = delegate_to_satellite_paused,
            undelegate_from_satellite_paused     = undelegate_from_satellite_paused,
            register_as_satellite_paused         = register_as_satellite_paused,
            unregister_as_satellite_paused       = unregister_as_satellite_paused,
            update_satellite_record_paused       = update_satellite_record_paused,
            distribute_reward_paused             = distribute_reward_paused
        )

    except BaseException as e:
         await save_error_report(e)

