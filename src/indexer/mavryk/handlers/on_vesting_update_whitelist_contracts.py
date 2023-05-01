from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.vesting.storage import VestingStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.vesting.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
import mavryk.models as models

async def on_vesting_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, VestingStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(models.Vesting, models.VestingWhitelistContract, update_whitelist_contracts)
    except BaseException as e:
         await save_error_report(e)

