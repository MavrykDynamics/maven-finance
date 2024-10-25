from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.utils.persisters import persist_linked_contract
from maven.types.emergency_governance.tezos_parameters.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.emergency_governance.tezos_storage import EmergencyGovernanceStorage
import maven.models as models

async def update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: TzktTransaction[UpdateGeneralContractsParameter, EmergencyGovernanceStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(ctx, models.EmergencyGovernance, models.EmergencyGovernanceGeneralContract, update_general_contracts)
    except BaseException as e:
        await save_error_report(e)

