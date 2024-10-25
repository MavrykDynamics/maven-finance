from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_linked_contract
from maven.types.treasury_factory.tezos_storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.treasury_factory.tezos_parameters.update_whitelist_contracts import UpdateWhitelistContractsParameter
import maven.models as models

async def update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: TzktTransaction[UpdateWhitelistContractsParameter, TreasuryFactoryStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(ctx, models.TreasuryFactory, models.TreasuryFactoryWhitelistContract, update_whitelist_contracts)

    except BaseException as e:
        await save_error_report(e)

