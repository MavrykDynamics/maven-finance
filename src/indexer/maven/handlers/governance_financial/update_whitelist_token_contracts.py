from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_linked_contract
from maven.types.governance_financial.tezos_storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.governance_financial.tezos_parameters.update_whitelist_token_contracts import UpdateWhitelistTokenContractsParameter
import maven.models as models

async def update_whitelist_token_contracts(
    ctx: HandlerContext,
    update_whitelist_token_contracts: TezosTransaction[UpdateWhitelistTokenContractsParameter, GovernanceFinancialStorage],
) -> None:

    try:    
        # Persist whitelist token contract
        await persist_linked_contract(ctx, models.GovernanceFinancial, models.GovernanceFinancialWhitelistTokenContract, update_whitelist_token_contracts)
    except BaseException as e:
        await save_error_report(e)

