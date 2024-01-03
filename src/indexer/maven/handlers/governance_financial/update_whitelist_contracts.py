from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_linked_contract
from maven.types.governance_financial.tezos_parameters.update_whitelist_contracts import UpdateWhitelistContractsParameter
from maven.types.governance_financial.tezos_storage import GovernanceFinancialStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext
import maven.models as models

async def update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: TzktTransaction[UpdateWhitelistContractsParameter, GovernanceFinancialStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(ctx, models.GovernanceFinancial, models.GovernanceFinancialWhitelistContract, update_whitelist_contracts)

    except BaseException as e:
        await save_error_report(e)

