
from dipdup.models import Transaction
from mavryk.types.governance.storage import GovernanceStorage
from mavryk.types.governance.parameter.update_satellite_snapshot import UpdateSatelliteSnapshotParameter
from dipdup.context import HandlerContext

async def on_governance_update_satellite_snapshot(
    ctx: HandlerContext,
    update_satellite_snapshot: Transaction[UpdateSatelliteSnapshotParameter, GovernanceStorage],
) -> None:
    breakpoint()