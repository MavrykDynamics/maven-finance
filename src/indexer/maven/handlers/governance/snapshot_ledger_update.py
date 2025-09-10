from maven.utils.error_reporting import save_error_report

from maven.types.governance.tezos_big_maps.snapshot_ledger_key import SnapshotLedgerKey
from maven.types.governance.tezos_big_maps.snapshot_ledger_value import SnapshotLedgerValue
from maven import models as models
from dipdup.context import HandlerContext
from tortoise.models import Q
from dipdup.models.tezos import TezosBigMapDiff

async def snapshot_ledger_update(
    ctx: HandlerContext,
    snapshot_ledger: TezosBigMapDiff[SnapshotLedgerKey, SnapshotLedgerValue],
) -> None:

    try:
        # Get update values
        key     = snapshot_ledger.key
        value   = snapshot_ledger.value
    
        # Create snapshot record
        if key and value:
            # Get the data
            governance_cycle                = int(key.nat)
            satellite_address               = key.address
            ready                           = value.ready
            total_smvn_balance              = float(value.totalStakedMvnBalance)
            total_delegated_amount          = float(value.totalDelegatedAmount)
            total_voting_power              = float(value.totalVotingPower)
            accumulated_rewards_per_share   = float(value.accumulatedRewardsPerShare)
            next_snapshot_cycle_id          = value.nextSnapshotCycleId
            if next_snapshot_cycle_id:
                next_snapshot_cycle_id  = int(next_snapshot_cycle_id)
    
            # Get governance record
            governance                      = await models.Governance.get(network = 'atlasnet')
            user                            = await models.get_user(network='atlasnet', address=satellite_address)
            snapshot_record, _              = await models.GovernanceSatelliteSnapshot.get_or_create(
                governance              = governance,
                user                    = user,
                cycle                   = governance_cycle
            )
            snapshot_record.ready                           = ready
            snapshot_record.total_smvn_balance              = total_smvn_balance
            snapshot_record.total_delegated_amount          = total_delegated_amount
            snapshot_record.total_voting_power              = total_voting_power
            snapshot_record.accumulated_rewards_per_share   = accumulated_rewards_per_share
            snapshot_record.next_snapshot_cycle_id          = next_snapshot_cycle_id
            await snapshot_record.save()

            # Reset the latest for the previous records
            await models.GovernanceSatelliteSnapshot.filter(
                Q(user = user),
                Q(governance = governance)
            ).update(
                latest  = False
            )
            latest_snapshot                 = await models.GovernanceSatelliteSnapshot.filter(
                Q(user = user),
                Q(governance = governance)
            ).order_by(
                '-cycle'
            ).first()
            latest_snapshot.latest          = True
            await latest_snapshot.save()

    except BaseException as e:
        await save_error_report(e)

