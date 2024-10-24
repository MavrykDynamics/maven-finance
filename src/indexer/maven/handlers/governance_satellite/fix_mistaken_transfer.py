from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_governance_satellite_action
from maven.types.governance_satellite.tezos_storage import GovernanceSatelliteStorage
from maven.types.governance_satellite.tezos_parameters.fix_mistaken_transfer import FixMistakenTransferParameter
from dipdup.models.tezos import TezosTransaction
from dipdup.context import HandlerContext

async def fix_mistaken_transfer(
    ctx: HandlerContext,
    fix_mistaken_transfer: TezosTransaction[FixMistakenTransferParameter, GovernanceSatelliteStorage],
) -> None:

    try:
        # Get operation info
        await persist_governance_satellite_action(ctx, fix_mistaken_transfer)

    except BaseException as e:
        await save_error_report(e)

