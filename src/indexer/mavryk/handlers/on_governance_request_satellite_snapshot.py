
from dipdup.context import HandlerContext
from mavryk.types.governance.storage import GovernanceStorage
from mavryk.types.governance.parameter.request_satellite_snapshot import RequestSatelliteSnapshotParameter
from dipdup.models import Transaction

async def on_governance_request_satellite_snapshot(
    ctx: HandlerContext,
    request_satellite_snapshot: Transaction[RequestSatelliteSnapshotParameter, GovernanceStorage],
) -> None:
    ...