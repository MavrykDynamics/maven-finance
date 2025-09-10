from maven.utils.contracts import get_token_standard
from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_linked_contract
from maven.types.treasury.tezos_parameters.update_whitelist_token_contracts import UpdateWhitelistTokenContractsParameter
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.treasury.tezos_storage import TreasuryStorage
from maven import models as models

async def update_whitelist_token_contracts(
    ctx: HandlerContext,
    update_whitelist_token_contracts: TezosTransaction[UpdateWhitelistTokenContractsParameter, TreasuryStorage],
) -> None:

    try:    
        # Persist whitelist token contract
        await persist_linked_contract(ctx, models.Treasury, models.TreasuryWhitelistTokenContract, update_whitelist_token_contracts)

        # Get operation info
        treasury_address    = update_whitelist_token_contracts.data.target_address
        token_address       = update_whitelist_token_contracts.parameter.tokenContractAddress

        # Get the token standard
        standard = await get_token_standard(
            ctx,
            token_address
        )
        
        # Update the record
        treasury            = await models.Treasury.get(
            network             = 'atlasnet',
            address             = treasury_address
        )
        token, _            = await models.Token.get_or_create(
            network             = 'atlasnet',
            token_address       = token_address
        )
        token.token_standard    = standard
        await token.save()
        whitelisted         = await models.TreasuryWhitelistTokenContract.exists(
            contract            = treasury,
            contract_address    = token_address
        )
        
        # Whitelist all balances of this token for this treasury
        treasury_balances   = await models.TreasuryBalance.filter(
            treasury    = treasury,
            token       = token
        ).all()
        for treasury_balance in treasury_balances:
            treasury_balance.whitelisted    = whitelisted
            await treasury_balance.save()

    except BaseException as e:
        await save_error_report(e)

