from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_linked_contract
from maven.types.doorman.tezos_storage import DoormanStorage
from dipdup.context import HandlerContext
from maven.types.doorman.tezos_parameters.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.models.tezos import TezosTransaction
from maven import models as models

async def update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: TezosTransaction[UpdateGeneralContractsParameter, DoormanStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(ctx, models.Doorman, models.DoormanGeneralContract, update_general_contracts)

    except BaseException as e:
        await save_error_report(e)

