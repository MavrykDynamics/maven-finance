
from mavryk.types.governance.big_map.snapshot_ledger_key import SnapshotLedgerKey
from mavryk.types.governance.big_map.snapshot_ledger_value import SnapshotLedgerValue
from mavryk import models as models
from dipdup.context import HandlerContext
from dipdup.models import BigMapDiff
import mavryk.models as models

async def on_governance_snapshot_ledger_update(
    ctx: HandlerContext,
    snapshot_ledger: BigMapDiff[SnapshotLedgerKey, SnapshotLedgerValue],
) -> None:

    # Get update values
    key     = snapshot_ledger.key
    value   = snapshot_ledger.value

    # Create snapshot record
    if key and value:
        # Get the data
        governance_address      = snapshot_ledger.data.contract_address
        governance_cycle        = int(key.nat)
        satellite_address       = key.address
        ready                   = value.ready
        total_smvk_balance      = float(value.totalStakedMvkBalance)
        total_delegated_amount  = float(value.totalDelegatedAmount)
        total_voting_power      = float(value.totalVotingPower)

        # Create a new snapshot record
        governance, _           = await models.Governance.get_or_create(
            address = governance_address
        )
        await governance.save()
        
        user, _                 = await models.MavrykUser.get_or_create(
            address = satellite_address
        )
        await user.save()

        snapshot_record         = models.GovernanceSatelliteSnapshotRecord(
            governance              = governance,
            user                    = user,
            ready                   = ready,
            total_smvk_balance      = total_smvk_balance,
            total_delegated_amount  = total_delegated_amount,
            total_voting_power      = total_voting_power,
            cycle                   = governance_cycle
        )
        await snapshot_record.save()
