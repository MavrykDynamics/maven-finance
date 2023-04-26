from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.m_token.parameter.update_operators import UpdateOperatorsParameter
from mavryk.types.m_token.storage import MTokenStorage
import mavryk.models as models


async def on_m_token_update_operators(
    ctx: HandlerContext,
    update_operators: Transaction[UpdateOperatorsParameter, MTokenStorage],
) -> None:

    try:
        # Get operation values
        operator_changes    = update_operators.parameter.__root__
        m_token_address     = update_operators.data.target_address
    
        # Update records
        m_token             = await models.MToken.get(
            address = m_token_address
        )
        for operatorChange in operator_changes:
            if hasattr(operatorChange, 'add_operator'):
                owner_address       = operatorChange.add_operator.owner
                operator_address    = operatorChange.add_operator.operator
                
                owner               = await models.mavryk_user_cache.get(address=owner_address)            
                operator            = await models.mavryk_user_cache.get(address=operator_address)
    
                operator_record, _  = await models.MTokenOperator.get_or_create(
                    m_token     = m_token,
                    owner       = owner,
                    operator    = operator
                )
                await operator_record.save()
            elif hasattr(operatorChange, 'remove_operator'):
                owner_address       = operatorChange.remove_operator.owner
                operator_address    = operatorChange.remove_operator.operator
                
                owner               = await models.mavryk_user_cache.get(address=owner_address)
                operator            = await models.mavryk_user_cache.get(address=operator_address)
    
                operator_record, _  = await models.MTokenOperator.get_or_create(
                    m_token     = m_token,
                    owner       = owner,
                    operator    = operator
                )
                await operator_record.delete()

    except BaseException:
         await save_error_report()

