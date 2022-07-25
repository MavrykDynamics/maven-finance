
from typing import Optional
from mavryk.types.governance.parameter.update_satellite_snapshot import UpdateSatelliteSnapshotParameter
from mavryk.types.delegation.parameter.register_as_satellite import RegisterAsSatelliteParameter
from dipdup.context import HandlerContext
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
from mavryk.types.delegation.storage import DelegationStorage
import mavryk.models as models

async def on_delegation_register_as_satellite(
    ctx: HandlerContext,
    register_as_satellite: Transaction[RegisterAsSatelliteParameter, DelegationStorage],
    update_satellite_snapshot: Optional[Transaction[UpdateSatelliteSnapshotParameter, GovernanceStorage]] = None,
) -> None:

    # Get operation values
    delegation_address      = register_as_satellite.data.target_address
    satellite_address       = register_as_satellite.data.sender_address
    name                    = register_as_satellite.parameter.name
    description             = register_as_satellite.parameter.description
    image                   = register_as_satellite.parameter.image
    website                 = register_as_satellite.parameter.website
    fee                     = int(register_as_satellite.parameter.satelliteFee)
    rewards_record          = register_as_satellite.storage.satelliteRewardsLedger[satellite_address]

    # Create and/or update record
    user, _ = await models.MavrykUser.get_or_create(
        address = satellite_address
    )
    delegation = await models.Delegation.get(
        address = delegation_address
    )
    satelliteRecord, _ = await models.SatelliteRecord.get_or_create(
        user        = user,
        delegation  = delegation
    )
    satelliteRecord.fee                             = fee
    satelliteRecord.name                            = name
    satelliteRecord.description                     = description
    satelliteRecord.image                           = image
    satelliteRecord.website                         = website
    satelliteRecord.currently_registered            = True

    satelliteRewardRecord, _ = await models.SatelliteRewardsRecord.get_or_create(
        user        = user,
        delegation  = delegation
    )
    satelliteRewardRecord.unpaid                                        = float(rewards_record.unpaid)
    satelliteRewardRecord.paid                                          = float(rewards_record.paid)
    satelliteRewardRecord.participation_rewards_per_share               = float(rewards_record.participationRewardsPerShare)
    satelliteRewardRecord.satellite_accumulated_reward_per_share        = float(rewards_record.satelliteAccumulatedRewardsPerShare)

    await user.save()
    await satelliteRecord.save()
    await satelliteRewardRecord.save()

    satelliteRewardRecord.reference                                     = satelliteRewardRecord
    await satelliteRewardRecord.save()

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
