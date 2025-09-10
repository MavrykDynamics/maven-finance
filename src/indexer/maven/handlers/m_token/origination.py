from maven.utils.contracts import get_contract_token_metadata, get_token_standard, get_contract_metadata
from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosOrigination
from maven.types.m_token.tezos_storage import MTokenStorage
from maven import models as models


async def origination(
    ctx: HandlerContext,
    m_token_origination: TezosOrigination[MTokenStorage],
) -> None:

    try:    
        # Get operation info
        m_token_address             = m_token_origination.data.originated_contract_address
        admin                       = m_token_origination.storage.admin
        loan_token_name             = m_token_origination.storage.loanToken
        is_scaled_token             = m_token_origination.storage.isScaledToken
        total_supply                = float(m_token_origination.storage.totalSupply)
        token_reward_index          = float(m_token_origination.storage.tokenRewardIndex)
        timestamp                   = m_token_origination.data.timestamp
    
        # Persist token metadata
        token_contract_metadata = await get_contract_token_metadata(
            ctx=ctx,
            token_address=m_token_address
        )
        
        # Get contract metadata
        contract_metadata = await get_contract_metadata(
            ctx=ctx,
            contract_address=m_token_address
        )
    
        # Get governance record
        governance                  = await models.Governance.get(network = 'atlasnet')

        # Get the token standard
        standard = await get_token_standard(
            ctx,
            m_token_address
        )

        # Get the related token
        token, _            = await models.Token.get_or_create(
            token_address       = m_token_address,
            network             = 'atlasnet',
            token_id            = 0
        )
        if token_contract_metadata:
            token.metadata          = token_contract_metadata
        token.token_standard    = standard
        await token.save()
    
        # Save MVN in DB
        m_token         = models.MToken(
            address                     = m_token_address,
            network                     = 'atlasnet',
            metadata                    = contract_metadata,
            token                       = token,
            admin                       = admin,
            last_updated_at             = timestamp,
            governance                  = governance,
            loan_token_name             = loan_token_name,
            is_scaled_token             = is_scaled_token,
            token_reward_index          = token_reward_index,
            total_supply                = total_supply
        )
        await m_token.save()
        
        # Create first users
        originated_ledger               = m_token_origination.storage.ledger
        originated_reward_index_ledger  = m_token_origination.storage.rewardIndexLedger
        for address in originated_ledger:
            new_user                    = await models.get_user(network='atlasnet', address=address)
            await new_user.save()
    
            user_account                = await models.MTokenAccount.get_or_create(
                m_token = m_token,
                user    = new_user
            )
            user_account.balance        = float(originated_ledger[address])
            user_account.reward_index   = float(originated_reward_index_ledger[address])
            await user_account.save()

    except BaseException as e:
        await save_error_report(e)

