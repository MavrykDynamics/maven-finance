
from dipdup.models import Origination
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
import mavryk.models as models

async def on_delegation_origination(
    ctx: HandlerContext,
    delegation_origination: Origination[DelegationStorage],
) -> None:
    # Get operation values
    delegationAddress               = delegation_origination.data.originated_contract_address
    minimumSmvkBalance              = int(delegation_origination.storage.config.minimumStakedMvkBalance)
    delegationRatio                 = int(delegation_origination.storage.config.delegationRatio)
    maxSatellites                   = int(delegation_origination.storage.config.maxSatellites)
    delegateToSatellitePaused       = delegation_origination.storage.breakGlassConfig.delegateToSatelliteIsPaused
    undelegateFromSatellitePaused   = delegation_origination.storage.breakGlassConfig.undelegateFromSatelliteIsPaused
    registerAsSatellitePaused       = delegation_origination.storage.breakGlassConfig.registerAsSatelliteIsPaused
    unregisterAsSatellitePaused     = delegation_origination.storage.breakGlassConfig.unregisterAsSatelliteIsPaused
    update_satellite_record_paused  = delegation_origination.storage.breakGlassConfig.updateSatelliteRecordIsPaused

    # Create contract
    delegation = models.Delegation(
        address                             = delegationAddress,
        minimum_smvk_balance                = minimumSmvkBalance,
        delegation_ratio                    = delegationRatio,
        max_satellites                      = maxSatellites,
        delegate_to_satellite_paused        = delegateToSatellitePaused,
        undelegate_from_satellite_paused    = undelegateFromSatellitePaused,
        register_as_satellite_paused        = registerAsSatellitePaused,
        unregister_as_satellite_paused      = unregisterAsSatellitePaused,
        update_satellite_record_paused      = update_satellite_record_paused
    )
    await delegation.save()