from mavryk.utils.error_reporting import save_error_report
from mavryk.utils.persisters import persist_linked_contract
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.m_token.tezos_parameters.update_whitelist_contracts import UpdateWhitelistContractsParameter
from mavryk.types.m_token.tezos_storage import MTokenStorage
import mavryk.models as models


async def update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: TzktTransaction[UpdateWhitelistContractsParameter, MTokenStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(ctx, models.MToken, models.MTokenWhitelistContract, update_whitelist_contracts)

    except BaseException as e:
        await save_error_report(e)

