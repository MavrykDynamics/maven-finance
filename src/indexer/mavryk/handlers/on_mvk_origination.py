
from dipdup.context import HandlerContext
from mavryk.types.mvk.storage import MvkStorage
from dipdup.models import Origination
from dateutil import parser 
import mavryk.models as models

async def on_mvk_origination(
    ctx: HandlerContext,
    mvk_origination: Origination[MvkStorage],
) -> None:
    
    # Get operation info
    mvk_address                 = mvk_origination.data.originated_contract_address
    admin                       = mvk_origination.storage.admin
    governance_address          = mvk_origination.storage.governanceAddress
    total_supply                = int(mvk_origination.storage.totalSupply)
    maximum_supply              = int(mvk_origination.storage.maximumSupply)
    inflation_rate              = int(mvk_origination.storage.inflationRate)
    next_inflation_timestamp    = parser.parse(mvk_origination.storage.nextInflationTimestamp)

    # Get or create governance record
    governance, _ = await models.Governance.get_or_create(address=governance_address)
    await governance.save();

    # Save MVK in DB
    mvk = models.MVKToken(
        address                     = mvk_address,
        admin                       = admin,
        governance                  = governance,
        total_supply                = total_supply,
        maximum_supply              = maximum_supply,
        inflation_rate              = inflation_rate,
        next_inflation_timestamp    = next_inflation_timestamp
    )
    await mvk.save()
    
    # Create first users
    originated_ledger = mvk_origination.data.storage['ledger']
    for address in originated_ledger:
        new_user, _ = await models.MavrykUser.get_or_create(
            address=address
        )
        new_user.mvk_balance = originated_ledger[address]
        await new_user.save()
