from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models import Origination
from mavryk.types.m_token.storage import MTokenStorage
from ..utils.persisters import persist_token_metadata
import mavryk.models as models


async def on_m_token_origination(
    ctx: HandlerContext,
    m_token_origination: Origination[MTokenStorage],
) -> None:

    try:    
        # Get operation info
        mvk_address                 = m_token_origination.data.originated_contract_address
        admin                       = m_token_origination.storage.admin
        governance_address          = m_token_origination.storage.governanceAddress
        loan_token_name             = m_token_origination.storage.loanToken
        is_scaled_token             = m_token_origination.storage.isScaledToken
        total_supply                = float(m_token_origination.storage.totalSupply)
        token_reward_index          = float(m_token_origination.storage.tokenRewardIndex)
        timestamp                   = m_token_origination.data.timestamp
    
        # Persist token metadata
        await persist_token_metadata(
            ctx=ctx,
            token_address=mvk_address
        )
    
        # Get or create governance record
        governance, _   = await models.Governance.get_or_create(address=governance_address)
        await governance.save();
    
        # Save MVK in DB
        m_token         = models.MToken(
            address                     = mvk_address,
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
            new_user                    = await models.mavryk_user_cache.get(address=address)
            await new_user.save()
    
            user_account                = await models.MTokenAccount.get_or_create(
                m_token = m_token,
                user    = new_user
            )
            user_account.balance        = float(originated_ledger[address])
            user_account.reward_index   = float(originated_reward_index_ledger[address])
            await user_account.save()

    except BaseException:
         await save_error_report()

