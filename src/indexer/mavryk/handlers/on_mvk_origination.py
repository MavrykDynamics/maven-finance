
from dipdup.context import HandlerContext
from mavryk.types.mvk.storage import MvkStorage
from dipdup.models import Origination
import mavryk.models as models

async def on_mvk_origination(
    ctx: HandlerContext,
    mvk_origination: Origination[MvkStorage],
) -> None:
    mvk_address = mvk_origination.data.originated_contract_address
    total_supply = int(mvk_origination.data.storage['totalSupply'])
    maximum_supply = int(mvk_origination.data.storage['maximumTotalSupply'])

    # Save MVK in DB
    mvk = models.MVKToken(
        address=mvk_address,
        total_supply=total_supply,
        maximum_supply=maximum_supply
    )
    await mvk.save()
    
    # Create first users
    originated_ledger = mvk_origination.data.storage['ledger']
    for address in originated_ledger:
        new_user, _ = await models.User.get_or_create(
            address=address
        )
        new_user.mvk_balance = originated_ledger[address]
        await new_user.save()
