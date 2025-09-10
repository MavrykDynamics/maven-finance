from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_linked_contract
from maven.types.treasury.tezos_storage import TreasuryStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.treasury.tezos_parameters.update_whitelist_contracts import UpdateWhitelistContractsParameter
from maven import models as models

async def update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: TezosTransaction[UpdateWhitelistContractsParameter, TreasuryStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(ctx, models.Treasury, models.TreasuryWhitelistContract, update_whitelist_contracts)

    except BaseException as e:
        await save_error_report(e)

