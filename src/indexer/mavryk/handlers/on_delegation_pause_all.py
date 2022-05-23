
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
from mavryk.types.delegation.parameter.pause_all import PauseAllParameter
import mavryk.models as models

async def on_delegation_pause_all(
    ctx: HandlerContext,
    pause_all: Transaction[PauseAllParameter, DelegationStorage],
) -> None:
    # Get operation values
    delegationAddress               = pause_all.data.target_address
    delegateToSatellitePaused       = pause_all.storage.breakGlassConfig.delegateToSatelliteIsPaused
    undelegateFromSatellitePaused   = pause_all.storage.breakGlassConfig.undelegateFromSatelliteIsPaused
    registerAsSatellitePaused       = pause_all.storage.breakGlassConfig.registerAsSatelliteIsPaused
    unregisterAsSatellitePaused     = pause_all.storage.breakGlassConfig.unregisterAsSatelliteIsPaused
    update_satellite_record_paused  = pause_all.storage.breakGlassConfig.updateSatelliteRecordIsPaused
    distribute_reward_paused        = pause_all.storage.breakGlassConfig.distributeRewardIsPaused

    # Update contract
    delegation                                      = await models.Delegation.get(address=delegationAddress)
    delegation.delegate_to_satellite_paused         = delegateToSatellitePaused
    delegation.undelegate_from_satellite_paused     = undelegateFromSatellitePaused
    delegation.register_as_satellite_paused         = registerAsSatellitePaused
    delegation.unregister_as_satellite_paused       = unregisterAsSatellitePaused
    delegation.update_satellite_record_paused       = update_satellite_record_paused
    delegation.distribute_reward_paused             = distribute_reward_paused
    await delegation.save()