
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.parameter.unpause_all import UnpauseAllParameter
from mavryk.types.delegation.storage import DelegationStorage
import mavryk.models as models

async def on_delegation_unpause_all(
    ctx: HandlerContext,
    unpause_all: Transaction[UnpauseAllParameter, DelegationStorage],
) -> None:
    # Get operation values
    delegationAddress               = unpause_all.data.target_address
    delegateToSatellitePaused       = unpause_all.storage.breakGlassConfig.delegateToSatelliteIsPaused
    undelegateFromSatellitePaused   = unpause_all.storage.breakGlassConfig.undelegateFromSatelliteIsPaused
    registerAsSatellitePaused       = unpause_all.storage.breakGlassConfig.registerAsSatelliteIsPaused
    unregisterAsSatellitePaused     = unpause_all.storage.breakGlassConfig.unregisterAsSatelliteIsPaused
    update_satellite_record_paused  = unpause_all.storage.breakGlassConfig.updateSatelliteRecordIsPaused
    distribute_reward_paused        = unpause_all.storage.breakGlassConfig.distributeRewardIsPaused

    # Update contract
    delegation                                      = await models.Delegation.get(address=delegationAddress)
    delegation.delegate_to_satellite_paused         = delegateToSatellitePaused
    delegation.undelegate_from_satellite_paused     = undelegateFromSatellitePaused
    delegation.register_as_satellite_paused         = registerAsSatellitePaused
    delegation.unregister_as_satellite_paused       = unregisterAsSatellitePaused
    delegation.update_satellite_record_paused       = update_satellite_record_paused
    delegation.distribute_reward_paused             = distribute_reward_paused
    await delegation.save()