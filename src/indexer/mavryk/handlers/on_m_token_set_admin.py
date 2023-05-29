from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_admin
from mavryk.types.m_token.parameter.set_admin import SetAdminParameter
from mavryk.types.m_token.storage import MTokenStorage
import mavryk.models as models


async def on_m_token_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, MTokenStorage],
) -> None:

    try:    
        # Get operation info
        target_contract = set_admin.data.target_address
        contract        = await models.MToken.get(network=ctx.datasource.network, address= target_contract)
    
        # Persist new admin
        await persist_admin(set_admin, contract)

    except BaseException as e:
         await save_error_report(e)

