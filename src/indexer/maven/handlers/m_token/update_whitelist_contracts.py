from maven.utils.error_reporting import save_error_report
from maven.utils.persisters import persist_linked_contract
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.m_token.tezos_parameters.update_whitelist_contracts import UpdateWhitelistContractsParameter
from maven.types.m_token.tezos_storage import MTokenStorage
from maven import models as models


async def update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: TezosTransaction[UpdateWhitelistContractsParameter, MTokenStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(ctx, models.MToken, models.MTokenWhitelistContract, update_whitelist_contracts)

    except BaseException as e:
        await save_error_report(e)

