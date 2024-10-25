from maven.utils.contracts import get_contract_token_metadata, get_token_standard, get_contract_metadata
from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.types.mvn_token.tezos_storage import MvnTokenStorage
from dipdup.models.tezos_tzkt import TzktOrigination
from dateutil import parser 
import maven.models as models

async def origination(
    ctx: HandlerContext,
    mvn_origination: TzktOrigination[MvnTokenStorage],
) -> None:

    try:    
        # Get operation info
        mvn_address                 = mvn_origination.data.originated_contract_address
        admin                       = mvn_origination.storage.admin
        total_supply                = int(mvn_origination.storage.totalSupply)
        maximum_supply              = int(mvn_origination.storage.maximumSupply)
        inflation_rate              = int(mvn_origination.storage.inflationRate)
        next_inflation_timestamp    = parser.parse(mvn_origination.storage.nextInflationTimestamp)
        timestamp                   = mvn_origination.data.timestamp
    
        # Persist token metadata
        token_contract_metadata = await get_contract_token_metadata(
            ctx=ctx,
            token_address=mvn_address
        )
        
        # Get contract metadata
        contract_metadata = await get_contract_metadata(
            ctx=ctx,
            contract_address=mvn_address
        )
    
        # Get governance record
        governance                  = await models.Governance.get(network = ctx.datasource.name.replace('mvkt_',''))

        # Get the token standard
        standard = await get_token_standard(
            ctx,
            mvn_address
        )

        # Get the related token
        token, _            = await models.Token.get_or_create(
            token_address       = mvn_address,
            network             = ctx.datasource.name.replace('mvkt_',''),
            token_id            = 0
        )
        if token_contract_metadata:
            token.metadata          = token_contract_metadata
        token.token_standard    = standard
        await token.save()
    
        # Save MVN in DB
        mvn = models.MVNToken(
            address                     = mvn_address,
            network                     = ctx.datasource.name.replace('mvkt_',''),
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
        await mvn.save()
        
        # Create first users
        originated_ledger = mvn_origination.storage.ledger
        for address in originated_ledger:
            new_user                = await models.maven_user_cache.get(network=ctx.datasource.name.replace('mvkt_',''), address=address)
            new_user.mvn_balance    = originated_ledger[address]
            await new_user.save()

    except BaseException as e:
        await save_error_report(e)

