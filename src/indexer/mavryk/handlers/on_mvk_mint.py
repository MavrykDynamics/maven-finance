
from mavryk.types.mvk.storage import MvkStorage
from dipdup.context import HandlerContext
from mavryk.types.mvk.parameter.mint import MintParameter
from dipdup.models import Transaction

async def on_mvk_mint(
    ctx: HandlerContext,
    mint: Transaction[MintParameter, MvkStorage],
) -> None:
    ...