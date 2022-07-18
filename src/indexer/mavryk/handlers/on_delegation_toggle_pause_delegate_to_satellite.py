
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
from mavryk.types.delegation.parameter.toggle_pause_delegate_to_satellite import TogglePauseDelegateToSatelliteParameter
import mavryk.models as models

async def on_delegation_toggle_pause_delegate_to_satellite(
    ctx: HandlerContext,
    toggle_pause_delegate_to_satellite: Transaction[TogglePauseDelegateToSatelliteParameter, DelegationStorage],
) -> None:
    # Get operation values
    delegationAddress               = toggle_pause_delegate_to_satellite.data.target_address
    delegateToSatellitePaused       = toggle_pause_delegate_to_satellite.storage.breakGlassConfig.delegateToSatelliteIsPaused
    undelegateFromSatellitePaused   = toggle_pause_delegate_to_satellite.storage.breakGlassConfig.undelegateFromSatelliteIsPaused
    registerAsSatellitePaused       = toggle_pause_delegate_to_satellite.storage.breakGlassConfig.registerAsSatelliteIsPaused
    unregisterAsSatellitePaused     = toggle_pause_delegate_to_satellite.storage.breakGlassConfig.unregisterAsSatelliteIsPaused
    update_satellite_record_paused  = toggle_pause_delegate_to_satellite.storage.breakGlassConfig.updateSatelliteRecordIsPaused
    distribute_reward_paused        = toggle_pause_delegate_to_satellite.storage.breakGlassConfig.distributeRewardIsPaused

    # Update contract
    delegation                                      = await models.Delegation.get(address=delegationAddress)
    delegation.delegate_to_satellite_paused         = delegateToSatellitePaused
    delegation.undelegate_from_satellite_paused     = undelegateFromSatellitePaused
    delegation.register_as_satellite_paused         = registerAsSatellitePaused
    delegation.unregister_as_satellite_paused       = unregisterAsSatellitePaused
    delegation.update_satellite_record_paused       = update_satellite_record_paused
    delegation.distribute_reward_paused             = distribute_reward_paused
    await delegation.save()