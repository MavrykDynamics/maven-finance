from typing import Optional
from dipdup.context import HandlerContext
from mavryk.types.governance.parameter.update_satellite_snapshot import UpdateSatelliteSnapshotParameter
from mavryk.types.governance.storage import GovernanceStorage
from mavryk.types.delegation.storage import DelegationStorage
from dipdup.models import Transaction
from mavryk.types.delegation.parameter.update_satellite_status import UpdateSatelliteStatusParameter
import mavryk.models as models

async def on_delegation_update_satellite_status(
    ctx: HandlerContext,
    update_satellite_status: Transaction[UpdateSatelliteStatusParameter, DelegationStorage],
    update_satellite_snapshot: Optional[Transaction[UpdateSatelliteSnapshotParameter, GovernanceStorage]] = None,
) -> None:

    # Get operation info
    delegation_address  = update_satellite_status.data.target_address
    satellite_address   = update_satellite_status.parameter.satelliteAddress
    new_status          = update_satellite_status.parameter.newStatus
    status_type         = models.SatelliteStatus.ACTIVE
    if new_status == "SUSPENDED":
        status_type = models.SatelliteStatus.SUSPENDED
    elif new_status == "BANNED":
        status_type = models.SatelliteStatus.BANNED

    # Create or update record
    delegation          = await models.Delegation.get(address   = delegation_address)
    user, _             = await models.MavrykUser.get_or_create(
        address = satellite_address
    )
    await user.save()
    satellite           = await models.SatelliteRecord.get(
        delegation  = delegation,
        user        = user
    )
    satellite.status    = status_type
    await satellite.save()

    # Create or update the satellite snapshot
    if update_satellite_snapshot:
        governance_address  = update_satellite_snapshot.data.target_address
        satellite_snapshots = update_satellite_snapshot.storage.snapshotLedger
        governance          = await models.Governance.get(address   = governance_address)
        governance_snapshot = await models.GovernanceSatelliteSnapshotRecord.get_or_none(
            governance  = governance,
            user        = user,
            cycle       = int(update_satellite_snapshot.storage.cycleCounter)
        )
        if not governance_snapshot and satellite_address in satellite_snapshots:
            satellite_snapshot   = satellite_snapshots[satellite_address]
            governance_snapshot  = models.GovernanceSatelliteSnapshotRecord(
                governance              = governance,
                user                    = user,
                cycle                   = int(update_satellite_snapshot.storage.cycleCounter),
                ready                   = satellite_snapshot.ready,
                total_smvk_balance      = float(satellite_snapshot.totalStakedMvkBalance),
                total_delegated_amount  = float(satellite_snapshot.totalDelegatedAmount),
                total_voting_power      = float(satellite_snapshot.totalVotingPower)
            )
            await governance_snapshot.save()