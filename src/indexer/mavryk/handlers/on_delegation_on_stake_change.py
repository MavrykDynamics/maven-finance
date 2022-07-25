from typing import Optional
from mavryk.types.delegation.parameter.on_stake_change import OnStakeChangeParameter
from dipdup.context import HandlerContext
from mavryk.types.governance.parameter.update_satellite_snapshot import UpdateSatelliteSnapshotParameter
from mavryk.types.governance.storage import GovernanceStorage
from mavryk.types.delegation.storage import DelegationStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_delegation_on_stake_change(
    ctx: HandlerContext,
    on_stake_change: Transaction[OnStakeChangeParameter, DelegationStorage],
    update_satellite_snapshot_0: Optional[Transaction[UpdateSatelliteSnapshotParameter, GovernanceStorage]] = None,
    update_satellite_snapshot_1: Optional[Transaction[UpdateSatelliteSnapshotParameter, GovernanceStorage]] = None,
) -> None:

    # Get operation info
    delegation_address      = on_stake_change.data.target_address
    user_address            = on_stake_change.parameter.__root__

    # Get and update records
    if user_address in on_stake_change.storage.satelliteRewardsLedger:
        rewards_record          = on_stake_change.storage.satelliteRewardsLedger[user_address]
        user, _                 = await models.MavrykUser.get_or_create(
            address = user_address
        )
        await user.save()
        delegation              = await models.Delegation.get(
            address = delegation_address
        )
        satellite_rewards, _    = await models.SatelliteRewardsRecord.get_or_create(
            user        = user,
            delegation  = delegation
        )
        satellite_rewards.unpaid                                    = float(rewards_record.unpaid)
        satellite_rewards.paid                                      = float(rewards_record.paid)
        satellite_rewards.participation_rewards_per_share           = float(rewards_record.participationRewardsPerShare)
        satellite_rewards.satellite_accumulated_reward_per_share    = float(rewards_record.satelliteAccumulatedRewardsPerShare)
        await satellite_rewards.save()

    # Create or update the satellite snapshot
    governance_address  = on_stake_change.storage.governanceAddress
    governance          = await models.Governance.get(address   = governance_address)
    if update_satellite_snapshot_0:
        satellite_snapshots = update_satellite_snapshot_0.storage.snapshotLedger
        satellite_address   = update_satellite_snapshot_0.satellite_address
        satellite, _        = await models.MavrykUser.get_or_create(address = satellite_address)
        await satellite.save()
        governance_snapshot = await models.GovernanceSatelliteSnapshotRecord.get_or_none(
            governance  = governance,
            user        = satellite,
            cycle       = int(update_satellite_snapshot_0.storage.cycleCounter)
        )
        if not governance_snapshot and satellite_address in satellite_snapshots:
            satellite_snapshot   = satellite_snapshots[satellite_address]
            governance_snapshot  = models.GovernanceSatelliteSnapshotRecord(
                governance              = governance,
                user                    = satellite,
                cycle                   = int(update_satellite_snapshot_0.storage.cycleCounter),
                ready                   = satellite_snapshot.ready,
                total_smvk_balance      = float(satellite_snapshot.totalStakedMvkBalance),
                total_delegated_amount  = float(satellite_snapshot.totalDelegatedAmount),
                total_voting_power      = float(satellite_snapshot.totalVotingPower)
            )
            await governance_snapshot.save()

    if update_satellite_snapshot_1:
        satellite_snapshots = update_satellite_snapshot_1.storage.snapshotLedger
        satellite_address   = update_satellite_snapshot_1.satellite_address
        satellite, _        = await models.MavrykUser.get_or_create(address = satellite_address)
        await satellite.save()
        governance_snapshot = await models.GovernanceSatelliteSnapshotRecord.get_or_none(
            governance  = governance,
            user        = satellite,
            cycle       = int(update_satellite_snapshot_1.storage.cycleCounter)
        )
        if not governance_snapshot and satellite_address in satellite_snapshots:
            satellite_snapshot   = satellite_snapshots[satellite_address]
            governance_snapshot  = models.GovernanceSatelliteSnapshotRecord(
                governance              = governance,
                user                    = satellite,
                cycle                   = int(update_satellite_snapshot_1.storage.cycleCounter),
                ready                   = satellite_snapshot.ready,
                total_smvk_balance      = float(satellite_snapshot.totalStakedMvkBalance),
                total_delegated_amount  = float(satellite_snapshot.totalDelegatedAmount),
                total_voting_power      = float(satellite_snapshot.totalVotingPower)
            )
            await governance_snapshot.save()
