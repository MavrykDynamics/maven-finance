
from mavryk.types.delegation.parameter.toggle_pause_distribute_reward import TogglePauseDistributeRewardParameter
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_delegation_toggle_pause_distribute_reward(
    ctx: HandlerContext,
    toggle_pause_distribute_reward: Transaction[TogglePauseDistributeRewardParameter, DelegationStorage],
) -> None:
    # Get operation values
    delegationAddress               = toggle_pause_distribute_reward.data.target_address
    delegateToSatellitePaused       = toggle_pause_distribute_reward.storage.breakGlassConfig.delegateToSatelliteIsPaused
    undelegateFromSatellitePaused   = toggle_pause_distribute_reward.storage.breakGlassConfig.undelegateFromSatelliteIsPaused
    registerAsSatellitePaused       = toggle_pause_distribute_reward.storage.breakGlassConfig.registerAsSatelliteIsPaused
    unregisterAsSatellitePaused     = toggle_pause_distribute_reward.storage.breakGlassConfig.unregisterAsSatelliteIsPaused
    update_satellite_record_paused  = toggle_pause_distribute_reward.storage.breakGlassConfig.updateSatelliteRecordIsPaused
    distribute_reward_paused        = toggle_pause_distribute_reward.storage.breakGlassConfig.distributeRewardIsPaused

    # Update contract
    delegation                                      = await models.Delegation.get(address=delegationAddress)
    delegation.delegate_to_satellite_paused         = delegateToSatellitePaused
    delegation.undelegate_from_satellite_paused     = undelegateFromSatellitePaused
    delegation.register_as_satellite_paused         = registerAsSatellitePaused
    delegation.unregister_as_satellite_paused       = unregisterAsSatellitePaused
    delegation.update_satellite_record_paused       = update_satellite_record_paused
    delegation.distribute_reward_paused             = distribute_reward_paused
    await delegation.save()