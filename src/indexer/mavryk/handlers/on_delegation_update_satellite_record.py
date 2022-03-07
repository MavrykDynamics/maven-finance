
from mavryk.types.delegation.parameter.update_satellite_record import UpdateSatelliteRecordParameter
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage

async def on_delegation_update_satellite_record(
    ctx: HandlerContext,
    update_satellite_record: Transaction[UpdateSatelliteRecordParameter, DelegationStorage],
) -> None:
    ...