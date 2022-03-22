from dipdup.context import HandlerContext
from mavryk.types.governance.storage import GovernanceStorage
from mavryk.types.governance.parameter.request_staked_mvk_snapshot import RequestStakedMvkSnapshotParameter
from dipdup.models import Transaction
import mavryk.models as models

async def on_governance_request_staked_mvk_snapshot(
    ctx: HandlerContext,
    request_staked_mvk_snapshot: Transaction[RequestStakedMvkSnapshotParameter, GovernanceStorage],
) -> None:
    # Get operation values
    requestID                   = int(request_staked_mvk_snapshot.parameter.__root__)
    requestStorage              = request_staked_mvk_snapshot.storage.financialRequestLedger[request_staked_mvk_snapshot.parameter.__root__]
    requestSMVKTotalSupply      = float(requestStorage.snapshotStakedMvkTotalSupply)
    requestSMVKRequired         = float(requestStorage.stakedMvkRequiredForApproval)
    requestReady                = requestStorage.ready

    # Update record
    request = await models.GovernanceFinancialRequestRecord.get(
        id  = requestID
    )
    request.smvk_required_for_approval  = requestSMVKRequired
    request.snapshot_smvk_total_supply  = requestSMVKTotalSupply
    request.ready                       = requestReady
    await request.save()
