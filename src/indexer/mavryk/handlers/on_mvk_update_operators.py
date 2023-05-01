from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.mvk_token.storage import MvkTokenStorage
from mavryk.types.mvk_token.parameter.update_operators import UpdateOperatorsParameter
import mavryk.models as models

async def on_mvk_update_operators(
    ctx: HandlerContext,
    update_operators: Transaction[UpdateOperatorsParameter, MvkTokenStorage],
) -> None:

    try:
        # Get operation values
        operator_changes    = update_operators.parameter.__root__
        mvk_token_address   = update_operators.data.target_address
    
        # Update records
        mvk_token           = await models.MVKToken.get(
            address = mvk_token_address
        )
        for operatorChange in operator_changes:
            if hasattr(operatorChange, 'add_operator'):
                owner_address       = operatorChange.add_operator.owner
                operator_address    = operatorChange.add_operator.operator
                
                owner               = await models.mavryk_user_cache.get(address=owner_address)            
                operator            = await models.mavryk_user_cache.get(address=operator_address)
    
                operator_record, _  = await models.MVKTokenOperator.get_or_create(
                    mvk_token   = mvk_token,
                    owner       = owner,
                    operator    = operator
                )
                await operator_record.save()
            elif hasattr(operatorChange, 'remove_operator'):
                owner_address       = operatorChange.remove_operator.owner
                operator_address    = operatorChange.remove_operator.operator
                
                owner               = await models.mavryk_user_cache.get(address=owner_address)
                operator            = await models.mavryk_user_cache.get(address=operator_address)
    
                operator_record, _  = await models.MVKTokenOperator.get_or_create(
                    mvk_token   = mvk_token,
                    owner       = owner,
                    operator    = operator
                )
                await operator_record.delete()

    except BaseException as e:
         await save_error_report(e)

