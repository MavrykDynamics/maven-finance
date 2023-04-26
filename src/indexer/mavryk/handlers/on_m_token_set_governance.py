from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_governance
from mavryk.types.m_token.parameter.set_governance import SetGovernanceParameter
from mavryk.types.m_token.storage import MTokenStorage
import mavryk.models as models


async def on_m_token_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, MTokenStorage],
) -> None:

    try:    
        # Get operation info
        target_contract = set_governance.data.target_address
        contract        = await models.MToken.get(address = target_contract)
    
        # Persist new admin
        await persist_governance(set_governance, contract)

    except BaseException:
         await save_error_report()

