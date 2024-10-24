from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos import TezosTransaction
from dipdup.context import HandlerContext
from maven.types.delegation.tezos_storage import DelegationStorage
from maven.types.delegation.tezos_parameters.pause_all import PauseAllParameter
import maven.models as models

async def pause_all(
    ctx: HandlerContext,
    pause_all: TezosTransaction[PauseAllParameter, DelegationStorage],
) -> None:

    try:
        # Get operation values
        delegation_address                  = pause_all.data.target_address
        delegate_to_satellite_paused        = pause_all.storage.breakGlassConfig.delegateToSatelliteIsPaused
        undelegate_from_satellite_paused    = pause_all.storage.breakGlassConfig.undelegateFromSatelliteIsPaused
        register_as_satellite_paused        = pause_all.storage.breakGlassConfig.registerAsSatelliteIsPaused
        unregister_as_satellite_paused      = pause_all.storage.breakGlassConfig.unregisterAsSatelliteIsPaused
        update_satellite_record_paused      = pause_all.storage.breakGlassConfig.updateSatelliteRecordIsPaused
        distribute_reward_paused            = pause_all.storage.breakGlassConfig.distributeRewardIsPaused
        take_satellites_snapshot_paused     = pause_all.storage.breakGlassConfig.takeSatellitesSnapshotPaused

        # Update contract
        await models.Delegation.filter(network='atlasnet', address=delegation_address).update(
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

