from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.treasury.storage import TreasuryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
import mavryk.models as models

async def on_treasury_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, TreasuryStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(ctx, models.Treasury, models.TreasuryWhitelistContract, update_whitelist_contracts)

    except BaseException as e:
         await save_error_report(e)

