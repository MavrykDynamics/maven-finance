from mavryk.utils.error_reporting import save_error_report

from mavryk.types.governance.tezos_big_maps.snapshot_ledger_key import SnapshotLedgerKey
from mavryk.types.governance.tezos_big_maps.snapshot_ledger_value import SnapshotLedgerValue
from mavryk import models as models
from dipdup.context import HandlerContext
from dipdup.models import Q
from dipdup.models.tezos_tzkt import TzktBigMapDiff
import mavryk.models as models

async def snapshot_ledger_update(
    ctx: HandlerContext,
    snapshot_ledger: TzktBigMapDiff[SnapshotLedgerKey, SnapshotLedgerValue],
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
            total_smvk_balance              = float(value.totalStakedMvkBalance)
            total_delegated_amount          = float(value.totalDelegatedAmount)
            total_voting_power              = float(value.totalVotingPower)
            accumulated_rewards_per_share   = float(value.accumulatedRewardsPerShare)
            next_snapshot_cycle_id          = value.nextSnapshotCycleId
            if next_snapshot_cycle_id:
                next_snapshot_cycle_id  = int(next_snapshot_cycle_id)
    
            # Get governance record
            governance                  = await models.Governance.get(network = ctx.datasource.network)
            user                    = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=satellite_address)
            snapshot_record, _      = await models.GovernanceSatelliteSnapshot.get_or_create(
                governance              = governance,
                user                    = user,
                cycle                   = governance_cycle
            )
            snapshot_record.ready                           = ready
            snapshot_record.total_smvk_balance              = total_smvk_balance
            snapshot_record.total_delegated_amount          = total_delegated_amount
            snapshot_record.total_voting_power              = total_voting_power
            snapshot_record.accumulated_rewards_per_share   = accumulated_rewards_per_share
            snapshot_record.next_snapshot_cycle_id          = next_snapshot_cycle_id
            await snapshot_record.save()

            # Reset the latest for the previous records
            await models.GovernanceSatelliteSnapshot.filter(
                Q(user = user),
                ~Q(cycle = governance_cycle)
            ).update(
                latest  = False
            )

    except BaseException as e:
        await save_error_report(e)

