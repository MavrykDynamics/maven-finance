from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_linked_contract
from maven.types.delegation.tezos_parameters.update_whitelist_contracts import UpdateWhitelistContractsParameter
from dipdup.context import HandlerContext
from maven.types.delegation.tezos_storage import DelegationStorage
from dipdup.models.tezos import TezosTransaction
import maven.models as models

async def update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: TezosTransaction[UpdateWhitelistContractsParameter, DelegationStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(ctx, models.Delegation, models.DelegationWhitelistContract, update_whitelist_contracts)
    except BaseException as e:
        await save_error_report(e)

