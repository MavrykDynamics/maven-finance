
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.mvk.storage import MvkStorage
from mavryk.types.mvk.parameter.update_operators import UpdateOperatorsParameter
import mavryk.models as models

async def on_mvk_update_operators(
    ctx: HandlerContext,
    update_operators: Transaction[UpdateOperatorsParameter, MvkStorage],
) -> None:

    # Get operation values
    operatorChanges = update_operators.parameter.__root__

    for operatorChange in operatorChanges:
        if hasattr(operatorChange, 'add_operator'):
            ownerAddress        = operatorChange.add_operator.owner
            operatorAddress     = operatorChange.add_operator.operator
            
            owner, _            = await models.MavrykUser.get_or_create(
                address = ownerAddress
            )
            await owner.save()
            
            operator, _         = await models.MavrykUser.get_or_create(
                address = operatorAddress
            )
            await operator.save()

            operatorRecord, _   = await models.MavrykUserOperator.get_or_create(
                owner       = owner,
                operator    = operator
            )
            await operatorRecord.save()
        elif hasattr(operatorChange, 'remove_operator'):
            ownerAddress        = operatorChange.remove_operator.owner
            operatorAddress     = operatorChange.remove_operator.operator
            
            owner, _            = await models.MavrykUser.get_or_create(
                address = ownerAddress
            )
            await owner.save()
            
            operator, _         = await models.MavrykUser.get_or_create(
                address = operatorAddress
            )
            await operator.save()

            operatorRecord, _   = await models.MavrykUserOperator.get_or_create(
                owner       = owner,
                operator    = operator
            )
            await operatorRecord.delete()
