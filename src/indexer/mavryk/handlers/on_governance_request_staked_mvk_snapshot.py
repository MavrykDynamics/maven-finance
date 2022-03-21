
from dipdup.context import HandlerContext
from mavryk.types.governance.storage import GovernanceStorage
from mavryk.types.governance.parameter.request_staked_mvk_snapshot import RequestStakedMvkSnapshotParameter
from dipdup.models import Transaction

async def on_governance_request_staked_mvk_snapshot(
    ctx: HandlerContext,
    request_staked_mvk_snapshot: Transaction[RequestStakedMvkSnapshotParameter, GovernanceStorage],
) -> None:
    ...