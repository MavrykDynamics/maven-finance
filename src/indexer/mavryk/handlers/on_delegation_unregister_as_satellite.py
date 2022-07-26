from typing import Optional
from mavryk.types.delegation.parameter.unregister_as_satellite import UnregisterAsSatelliteParameter
from dipdup.context import HandlerContext
from mavryk.types.governance.parameter.update_satellite_snapshot import UpdateSatelliteSnapshotParameter
from mavryk.types.governance.storage import GovernanceStorage
from mavryk.types.delegation.storage import DelegationStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_delegation_unregister_as_satellite(
    ctx: HandlerContext,
    unregister_as_satellite: Transaction[UnregisterAsSatelliteParameter, DelegationStorage],
    update_satellite_snapshot: Optional[Transaction[UpdateSatelliteSnapshotParameter, GovernanceStorage]] = None,
) -> None:

    # Get operation values
    delegation_address      = unregister_as_satellite.data.target_address
    satellite_address       = unregister_as_satellite.data.sender_address
    rewards_record          = unregister_as_satellite.storage.satelliteRewardsLedger[satellite_address]

    # Delete records
    user, _ = await models.MavrykUser.get_or_create(
        address = satellite_address
    )
    delegation = await models.Delegation.get(
        address = delegation_address
    )
    satelliteRewardRecord, _ = await models.SatelliteRewardsRecord.get_or_create(
        user        = user,
        delegation  = delegation
    )
    satelliteRewardRecord.unpaid                                        = float(rewards_record.unpaid)
    satelliteRewardRecord.paid                                          = float(rewards_record.paid)
    satelliteRewardRecord.participation_rewards_per_share               = float(rewards_record.participationRewardsPerShare)
    satelliteRewardRecord.satellite_accumulated_reward_per_share        = float(rewards_record.satelliteAccumulatedRewardsPerShare)

    satelliteRecord = await models.SatelliteRecord.get(
        user = user
    )
    await user.save()
    
    satelliteRecord.currently_registered    = False
    await satelliteRecord.save()

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
