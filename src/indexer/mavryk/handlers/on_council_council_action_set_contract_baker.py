from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_council_action
from mavryk.types.council.storage import CouncilStorage
from dipdup.models import Transaction
from mavryk.types.council.parameter.council_action_set_contract_baker import CouncilActionSetContractBakerParameter

async def on_council_council_action_set_contract_baker(
    ctx: HandlerContext,
    council_action_set_contract_baker: Transaction[CouncilActionSetContractBakerParameter, CouncilStorage],
) -> None:

    try:    
        await persist_council_action(council_action_set_contract_baker)
    except BaseException as e:
         await save_error_report(e)

