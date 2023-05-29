from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.delegation.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_delegation_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, DelegationStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(ctx, models.Delegation, models.DelegationWhitelistContract, update_whitelist_contracts)
    except BaseException as e:
         await save_error_report(e)

