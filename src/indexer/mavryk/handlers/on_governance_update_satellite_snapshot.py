
from dipdup.models import Transaction
from mavryk.types.governance.storage import GovernanceStorage
from mavryk.types.governance.parameter.update_satellite_snapshot import UpdateSatelliteSnapshotParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_governance_update_satellite_snapshot(
    ctx: HandlerContext,
    update_satellite_snapshot: Transaction[UpdateSatelliteSnapshotParameter, GovernanceStorage],
) -> None:

    # Get operation values
    governance_address  = update_satellite_snapshot.data.target_address
    satellite_address   = update_satellite_snapshot.parameter.satelliteAddress
    snapshot_storage    = update_satellite_snapshot.storage.snapshotLedger[satellite_address]

    # Create and Update records
    governance              = await models.Governance.get(
        address = governance_address
    )
    user, _                 = await models.MavrykUser.get_or_create(
        address = satellite_address
    )
    await user.save()
    governance_snapshot, _  = await models.GovernanceSatelliteSnapshotRecord.get_or_create(
        governance  = governance,
        user        = user,
        cycle       = int(snapshot_storage.cycle)
    )
    governance_snapshot.ready                   = snapshot_storage.ready
    governance_snapshot.total_smvk_balance      = float(snapshot_storage.totalStakedMvkBalance)
    governance_snapshot.total_delegated_amount  = float(snapshot_storage.totalDelegatedAmount)
    governance_snapshot.total_voting_power      = float(snapshot_storage.totalVotingPower)
    await governance_snapshot.save()
