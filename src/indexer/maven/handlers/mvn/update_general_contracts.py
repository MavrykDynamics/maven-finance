from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.utils.persisters import persist_linked_contract
from maven.types.mvn_token.tezos_storage import MvnTokenStorage
from maven.types.mvn_token.tezos_parameters.update_general_contracts import UpdateGeneralContractsParameter
import maven.models as models

async def update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: TezosTransaction[UpdateGeneralContractsParameter, MvnTokenStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(ctx, models.MVNToken, models.MVNTokenGeneralContract, update_general_contracts)
    except BaseException as e:
        await save_error_report(e)

