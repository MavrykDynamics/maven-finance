from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.m_token.parameter.mint_or_burn import MintOrBurnParameter
from mavryk.types.m_token.storage import MTokenStorage
import mavryk.models as models


async def on_m_token_mint_or_burn(
    ctx: HandlerContext,
    mint_or_burn: Transaction[MintOrBurnParameter, MTokenStorage],
) -> None:

    try:    
        # Get operation info
        timestamp                   = mint_or_burn.data.timestamp
        level                       = int(mint_or_burn.data.level)
        operation_hash              = mint_or_burn.data.hash
        m_token_address             = mint_or_burn.data.target_address
        user_address                = mint_or_burn.parameter.target
        token_reward_index          = float(mint_or_burn.storage.tokenRewardIndex)
        user_balance                = float(mint_or_burn.storage.ledger[user_address])
        user_reward_index           = float(mint_or_burn.storage.rewardIndexLedger[user_address])
        total_supply                = float(mint_or_burn.storage.totalSupply)
    
        # Update record
        m_token                     = await models.MToken.get(
            address = m_token_address
        )
        m_token.token_reward_index  = token_reward_index
        m_token.total_supply        = total_supply
        await m_token.save()
    
        user                        = await models.mavryk_user_cache.get(address=user_address)
        user_account, _             = await models.MTokenAccount.get_or_create(
            m_token = m_token,
            user    = user
        )
        user_account.rewards_earned += (token_reward_index - user_account.reward_index) * user_account.balance
        user_account.balance        = user_balance
        user_account.reward_index   = user_reward_index
        await user_account.save()
    
        user_account_history_data   = models.MTokenAccountHistoryData(
            timestamp       = timestamp,
            level           = level,
            operation_hash  = operation_hash,
            type            = models.MTokenOperationType.MINT_OR_BURN,
            m_token_account = user_account,
            balance         = user_account.balance,
            reward_index    = user_account.reward_index,
            rewards_earned  = user_account.rewards_earned
        )
        await user_account_history_data.save()

    except BaseException:
         await save_error_report()

