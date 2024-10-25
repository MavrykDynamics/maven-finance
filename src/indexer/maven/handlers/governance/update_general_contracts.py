from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_linked_contract
from maven.types.governance.tezos_parameters.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.context import HandlerContext
from maven.types.governance.tezos_storage import GovernanceStorage
from dipdup.models.tezos_tzkt import TzktTransaction
import maven.models as models

async def update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: TzktTransaction[UpdateGeneralContractsParameter, GovernanceStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(ctx, models.Governance, models.GovernanceGeneralContract, update_general_contracts)
    except BaseException as e:
        await save_error_report(e)

