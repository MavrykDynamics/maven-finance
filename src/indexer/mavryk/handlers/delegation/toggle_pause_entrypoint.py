from mavryk.utils.error_reporting import save_error_report

from mavryk.types.delegation.tezos_storage import DelegationStorage
from mavryk.types.delegation.tezos_parameters.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: TzktTransaction[TogglePauseEntrypointParameter, DelegationStorage],
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
        take_satellites_snapshot_paused     = toggle_pause_entrypoint.storage.breakGlassConfig.takeSatellitesSnapshotPaused
        # Update contract
        await models.Delegation.filter(network=ctx.datasource.name.replace('tzkt_',''), address=delegation_address).update(
            delegate_to_satellite_paused        = delegate_to_satellite_paused,
            undelegate_from_satellite_paused    = undelegate_from_satellite_paused,
            register_as_satellite_paused        = register_as_satellite_paused,
            unregister_as_satellite_paused      = unregister_as_satellite_paused,
            update_satellite_record_paused      = update_satellite_record_paused,
            distribute_reward_paused            = distribute_reward_paused,
            take_satellites_snapshot_paused     = take_satellites_snapshot_paused
        )

    except BaseException as e:
        await save_error_report(e)

