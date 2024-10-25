from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.utils.persisters import persist_linked_contract
from maven.types.break_glass.tezos_parameters.update_whitelist_contracts import UpdateWhitelistContractsParameter
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.break_glass.tezos_storage import BreakGlassStorage
import maven.models as models

async def update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: TzktTransaction[UpdateWhitelistContractsParameter, BreakGlassStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(ctx, models.BreakGlass, models.BreakGlassWhitelistContract, update_whitelist_contracts)
    except BaseException as e:
        await save_error_report(e)

