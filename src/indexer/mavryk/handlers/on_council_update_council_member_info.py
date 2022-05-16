
from mavryk.types.council.parameter.update_council_member_info import UpdateCouncilMemberInfoParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.council.storage import CouncilStorage

async def on_council_update_council_member_info(
    ctx: HandlerContext,
    update_council_member_info: Transaction[UpdateCouncilMemberInfoParameter, CouncilStorage],
) -> None:
    ...