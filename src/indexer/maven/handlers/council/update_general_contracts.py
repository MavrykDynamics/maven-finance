from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.utils.persisters import persist_linked_contract
from maven.types.council.tezos_parameters.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.council.tezos_storage import CouncilStorage
import maven.models as models

async def update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: TzktTransaction[UpdateGeneralContractsParameter, CouncilStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(ctx, models.Council, models.CouncilGeneralContract, update_general_contracts)

    except BaseException as e:
        await save_error_report(e)

