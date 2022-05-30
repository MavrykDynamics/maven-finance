
from mavryk.types.mvk.storage import MvkStorage
from dipdup.context import HandlerContext
from mavryk.types.mvk.parameter.mint import MintParameter
from dipdup.models import Transaction
import mavryk.models as models

async def on_mvk_mint(
    ctx: HandlerContext,
    mint: Transaction[MintParameter, MvkStorage],
) -> None:

    # Get operation values
    mintAddress = mint.parameter.address
    newUserBalance = mint.storage.ledger[mintAddress]

    # Get mint account
    user, _ = await models.MavrykUser.get_or_create(
        address = mintAddress
    )
    user.mvk_balance = newUserBalance
    await user.save()