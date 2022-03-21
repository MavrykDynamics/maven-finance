
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.governance.parameter.set_satellite_voting_power_snapshot import SetSatelliteVotingPowerSnapshotParameter
from mavryk.types.governance.storage import GovernanceStorage
import mavryk.models as models

async def on_governance_set_satellite_voting_power_snapshot(
    ctx: HandlerContext,
    set_satellite_voting_power_snapshot: Transaction[SetSatelliteVotingPowerSnapshotParameter, GovernanceStorage],
) -> None:
    # Get operation values
    governanceAddress                   = set_satellite_voting_power_snapshot.data.target_address
    satelliteAddress                    = set_satellite_voting_power_snapshot.parameter.address
    satelliteSnapshotStorage            = set_satellite_voting_power_snapshot.storage.snapshotLedger[satelliteAddress]
    snapshotTotalMVKStorage             = satelliteSnapshotStorage.totalMvkBalance
    snapshotTotalDelegatedAmount        = satelliteSnapshotStorage.totalDelegatedAmount
    snapshotTotalVotingPower            = satelliteSnapshotStorage.totalVotingPower
    snapshotCurrentCycleStartLevel      = satelliteSnapshotStorage.currentCycleStartLevel
    snapshotCurrentCycleEndLevel        = satelliteSnapshotStorage.totalMvkBalance

    # Create or update record
    governance              = await models.Governance.get(
        address = governanceAddress
    )
    user,   _               = await models.MavrykUser.get_or_create(
        address = satelliteAddress
    )
    await user.save()
    satelliteRecord         = await models.SatelliteRecord.get(
        user    = user
    )
    satelliteSnapshot, _    = await models.GovernanceSatelliteSnapshotRecord.get_or_create(
        governance  = governance,
        satellite   = satelliteRecord
    )
    satelliteSnapshot.total_mvk_balance               = snapshotTotalMVKStorage
    satelliteSnapshot.total_delegated_amount          = snapshotTotalDelegatedAmount
    satelliteSnapshot.total_voting_power              = snapshotTotalVotingPower
    satelliteSnapshot.current_cycle_start_level       = snapshotCurrentCycleStartLevel
    satelliteSnapshot.current_cycle_end_level         = snapshotCurrentCycleEndLevel
    await satelliteSnapshot.save()
