
from typing import Optional
from dipdup.context import HandlerContext
from mavryk.types.governance.parameter.update_satellite_snapshot import UpdateSatelliteSnapshotParameter
from mavryk.types.governance.storage import GovernanceStorage
from mavryk.types.delegation.storage import DelegationStorage
from dipdup.models import Transaction
from mavryk.types.delegation.parameter.delegate_to_satellite import DelegateToSatelliteParameter
import mavryk.models as models

async def on_delegation_delegate_to_satellite(
    ctx: HandlerContext,
    delegate_to_satellite: Transaction[DelegateToSatelliteParameter, DelegationStorage],
    update_satellite_snapshot: Optional[Transaction[UpdateSatelliteSnapshotParameter, GovernanceStorage]] = None,
) -> None:

    # Get operation values
    delegation_address      = delegate_to_satellite.data.target_address
    satellite_address       = delegate_to_satellite.parameter.satelliteAddress
    user_address            = delegate_to_satellite.parameter.userAddress
    rewards_record          = delegate_to_satellite.storage.satelliteRewardsLedger[user_address]

    # Create and/or update record
    user, _ = await models.MavrykUser.get_or_create(
        address = user_address
    )
    satellite, _ = await models.MavrykUser.get_or_create(
        address = satellite_address
    )
    delegation = await models.Delegation.get(
        address = delegation_address
    )
    satelliteRecord, _ = await models.SatelliteRecord.get_or_create(
        user        = satellite_address,
        delegation  = delegation
    )
    satelliteRewardReferenceRecord, _ = await models.SatelliteRewardsRecord.get_or_create(
        user        = satellite,
        delegation  = delegation
    )
    satelliteRewardRecord, _ = await models.SatelliteRewardsRecord.get_or_create(
        user        = user,
        delegation  = delegation
    )
    satelliteRewardRecord.reference                                     = satelliteRewardReferenceRecord
    satelliteRewardRecord.unpaid                                        = float(rewards_record.unpaid)
    satelliteRewardRecord.paid                                          = float(rewards_record.paid)
    satelliteRewardRecord.participation_rewards_per_share               = float(rewards_record.participationRewardsPerShare)
    satelliteRewardRecord.satellite_accumulated_reward_per_share        = float(rewards_record.satelliteAccumulatedRewardsPerShare)
    delegationRecord, _ = await models.DelegationRecord.get_or_create(
        user        = user,
        delegation  = delegation
    )
    delegationRecord.satellite_record = satelliteRecord
    await user.save()
    await satellite.save()
    await delegationRecord.save()
    await satelliteRecord.save()
    await satelliteRewardRecord.save()
    await satelliteRewardReferenceRecord.save()

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
