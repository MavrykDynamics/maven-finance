
from mavryk.types.mvk.storage import MvkStorage
from dipdup.models import Transaction
from mavryk.types.mvk.parameter.update_operators import UpdateOperatorsParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_mvk_update_operators(
    ctx: HandlerContext,
    update_operators: Transaction[UpdateOperatorsParameter, MvkStorage],
) -> None:
    update_operators = update_operators.parameter.__root__
    #TODO: Commented because the models refused to have a ManyToMany field from a user to another
    # for update_operator in update_operators:
    #     if hasattr(update_operator,'add_operator'):
    #         # Get addresses
    #         owner = update_operator.add_operator.owner
    #         operator = update_operator.add_operator.operator

    #         # Get or create users
    #         user_owner, _ = await models.MavrykUser.get_or_create(
    #             address=owner
    #         )
    #         user_operator, _ = await models.MavrykUser.get_or_create(
    #             address=operator
    #         )
    #         await user_owner.fetch_related()
    #         await user_owner.operators.add(user_operator)
            
    #         await user_owner.save()
    #     elif hasattr(update_operator,'remove_operator'):
    #         # Get addresses
    #         owner = update_operator.remove_operator.owner
    #         operator = update_operator.remove_operator.operator

    #         # Get or create users
    #         user_owner, _ = await models.MavrykUser.get_or_create(
    #             address=owner
    #         )
    #         user_operator, _ = await models.MavrykUser.get_or_create(
    #             address=operator
    #         )
    #         await user_owner.fetch_related()
    #         if user_operator in await user_owner.operators:
    #             user_owner.operators.remove(user_operator)
            
    #         await user_owner.save()
