from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_governance_satellite_action
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from mavryk.types.governance_satellite.parameter.fix_mistaken_transfer import FixMistakenTransferParameter
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_governance_satellite_fix_mistaken_transfer(
    ctx: HandlerContext,
    fix_mistaken_transfer: Transaction[FixMistakenTransferParameter, GovernanceSatelliteStorage],
) -> None:

    try:
        # Get operation info
        await persist_governance_satellite_action(ctx, fix_mistaken_transfer)

    except BaseException as e:
         await save_error_report(e)

