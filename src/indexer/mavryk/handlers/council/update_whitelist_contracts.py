from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.council.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.council.storage import CouncilStorage
import mavryk.models as models

async def update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, CouncilStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(ctx, models.Council, models.CouncilWhitelistContract, update_whitelist_contracts)
    except BaseException as e:
        await save_error_report(e)

