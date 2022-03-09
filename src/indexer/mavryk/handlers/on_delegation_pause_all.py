
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

    # Update contract
    doorman                                     = await models.Delegation.get(address=delegationAddress)
    doorman.delegate_to_satellite_paused        = delegateToSatellitePaused
    doorman.undelegate_from_satellite_paused    = undelegateFromSatellitePaused
    doorman.register_as_satellite_paused        = registerAsSatellitePaused
    doorman.unregister_as_satellite_paused      = unregisterAsSatellitePaused
    doorman.update_satellite_record_paused      = update_satellite_record_paused
    await doorman.save()