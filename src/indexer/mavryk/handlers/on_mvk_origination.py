from mavryk.utils.contracts import get_contract_token_metadata, get_token_standard, get_contract_metadata
from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.types.mvk_token.storage import MvkTokenStorage
from dipdup.models import Origination
from dateutil import parser 
import mavryk.models as models

async def on_mvk_origination(
    ctx: HandlerContext,
    mvk_origination: Origination[MvkTokenStorage],
) -> None:

    try:    
        # Get operation info
        mvk_address                 = mvk_origination.data.originated_contract_address
        admin                       = mvk_origination.storage.admin
        governance_address          = mvk_origination.storage.governanceAddress
        total_supply                = int(mvk_origination.storage.totalSupply)
        maximum_supply              = int(mvk_origination.storage.maximumSupply)
        inflation_rate              = int(mvk_origination.storage.inflationRate)
        next_inflation_timestamp    = parser.parse(mvk_origination.storage.nextInflationTimestamp)
        timestamp                   = mvk_origination.data.timestamp
    
        # Persist token metadata
        token_contract_metadata = await get_contract_token_metadata(
            ctx=ctx,
            token_address=mvk_address
        )
        
        # Get contract metadata
        contract_metadata = await get_contract_metadata(
            ctx=ctx,
            contract_address=mvk_address
        )
    
        # Get or create governance record
        governance, _ = await models.Governance.get_or_create(network = ctx.datasource.network, address=governance_address)
        await governance.save();

        # Get the token standard
        standard = await get_token_standard(
            ctx,
            mvk_address
        )

        # Get the related token
        token, _            = await models.Token.get_or_create(
            token_address       = mvk_address,
            network             = ctx.datasource.network,
            token_id            = 0
        )
        if token_contract_metadata:
            token.metadata          = token_contract_metadata
        token.token_standard    = standard
        await token.save()
    
        # Save MVK in DB
        mvk = models.MVKToken(
            address                     = mvk_address,
            network                     = ctx.datasource.network,
            metadata                    = contract_metadata,
            token                       = token,
            admin                       = admin,
            last_updated_at             = timestamp,
            governance                  = governance,
            total_supply                = total_supply,
            maximum_supply              = maximum_supply,
            inflation_rate              = inflation_rate,
            next_inflation_timestamp    = next_inflation_timestamp
        )
        await mvk.save()
        
        # Create first users
        originated_ledger = mvk_origination.storage.ledger
        for address in originated_ledger:
            new_user                = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=address)
            new_user.mvk_balance    = originated_ledger[address]
            await new_user.save()

    except BaseException as e:
         await save_error_report(e)

