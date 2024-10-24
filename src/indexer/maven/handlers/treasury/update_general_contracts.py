from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.utils.persisters import persist_linked_contract
from maven.types.treasury.tezos_parameters.update_general_contracts import UpdateGeneralContractsParameter
from maven.types.treasury.tezos_storage import TreasuryStorage
import maven.models as models

async def update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: TezosTransaction[UpdateGeneralContractsParameter, TreasuryStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(ctx, models.Treasury, models.TreasuryGeneralContract, update_general_contracts)

    except BaseException as e:
        await save_error_report(e)

