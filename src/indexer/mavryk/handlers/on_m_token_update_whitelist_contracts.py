from mavryk.utils.error_reporting import save_error_report
from mavryk.utils.persisters import persist_linked_contract
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.m_token.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from mavryk.types.m_token.storage import MTokenStorage
import mavryk.models as models


async def on_m_token_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, MTokenStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(models.MToken, models.MTokenWhitelistContract, update_whitelist_contracts)

    except BaseException as e:
         await save_error_report(e)

