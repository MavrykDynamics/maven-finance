from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_linked_contract
from maven.types.governance_financial.tezos_storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.governance_financial.tezos_parameters.update_general_contracts import UpdateGeneralContractsParameter
import maven.models as models

async def update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: TezosTransaction[UpdateGeneralContractsParameter, GovernanceFinancialStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(ctx, models.GovernanceFinancial, models.GovernanceFinancialGeneralContract, update_general_contracts)

    except BaseException as e:
        await save_error_report(e)

