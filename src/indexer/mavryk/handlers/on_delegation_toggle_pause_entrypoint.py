from mavryk.utils.error_reporting import save_error_report

from mavryk.types.delegation.storage import DelegationStorage
from mavryk.types.delegation.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_delegation_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, DelegationStorage],
) -> None:

    try:
        # Get operation values
        delegation_address                  = toggle_pause_entrypoint.data.target_address
        delegate_to_satellite_paused        = toggle_pause_entrypoint.storage.breakGlassConfig.delegateToSatelliteIsPaused
        undelegate_from_satellite_paused    = toggle_pause_entrypoint.storage.breakGlassConfig.undelegateFromSatelliteIsPaused
        register_as_satellite_paused        = toggle_pause_entrypoint.storage.breakGlassConfig.registerAsSatelliteIsPaused
        unregister_as_satellite_paused      = toggle_pause_entrypoint.storage.breakGlassConfig.unregisterAsSatelliteIsPaused
        update_satellite_record_paused      = toggle_pause_entrypoint.storage.breakGlassConfig.updateSatelliteRecordIsPaused
        distribute_reward_paused            = toggle_pause_entrypoint.storage.breakGlassConfig.distributeRewardIsPaused
    
        # Update contract
        delegation                                      = await models.Delegation.get(address=delegation_address)
        delegation.delegate_to_satellite_paused         = delegate_to_satellite_paused
        delegation.undelegate_from_satellite_paused     = undelegate_from_satellite_paused
        delegation.register_as_satellite_paused         = register_as_satellite_paused
        delegation.unregister_as_satellite_paused       = unregister_as_satellite_paused
        delegation.update_satellite_record_paused       = update_satellite_record_paused
        delegation.distribute_reward_paused             = distribute_reward_paused
        await delegation.save()

    except BaseException as e:
         await save_error_report(e)

