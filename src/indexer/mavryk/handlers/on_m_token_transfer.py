from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.m_token.parameter.transfer import TransferParameter
from mavryk.types.m_token.storage import MTokenStorage
import mavryk.models as models


async def on_m_token_transfer(
    ctx: HandlerContext,
    transfer: Transaction[TransferParameter, MTokenStorage],
) -> None:

    try:
        # Get transfer batch
        transaction_batch           = transfer.parameter.__root__
        m_token_address             = transfer.data.target_address
        user_ledger                 = transfer.storage.ledger
        reward_index_ledger         = transfer.storage.rewardIndexLedger
        token_reward_index          = float(transfer.storage.tokenRewardIndex)
        total_supply                = float(transfer.storage.totalSupply)
        timestamp                   = transfer.data.timestamp
        level                       = int(transfer.data.level)
        operation_hash              = transfer.data.hash
    
        # Get MVK Token
        token                       = await models.Token.get(
            network         = ctx.datasource.network,
            token_address   = m_token_address,
            token_id        = 0
        )
        m_token                     = await models.MToken.get(network=ctx.datasource.network, address=m_token_address, token=token)
        m_token.token_reward_index  = token_reward_index
        m_token.total_supply        = total_supply
        await m_token.save()
    
        for entry in transaction_batch:
            from_address            = entry.from_
            transactions            = entry.txs
    
            # Get or create from
            from_user               = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=from_address)
            from_account, _         = await models.MTokenAccount.get_or_create(
                m_token = m_token,
                user    = from_user
            )
            from_account.rewards_earned += (token_reward_index - from_account.reward_index) * from_account.balance
            from_account.balance        = float(user_ledger[from_address])
            from_account.reward_index   = float(reward_index_ledger[from_address])
            await from_account.save()
    
            from_account_history_data   = models.MTokenAccountHistoryData(
                timestamp       = timestamp,
                level           = level,
                operation_hash  = operation_hash,
                type            = models.MTokenOperationType.TRANSFER,
                m_token_account = from_account,
                balance         = from_account.balance,
                reward_index    = from_account.reward_index,
                rewards_earned  = from_account.rewards_earned
            )
            await from_account_history_data.save()
    
            for transaction in transactions:
                to_address          = transaction.to_
    
                # Get or create to
                to_user             = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=to_address)
                to_account, _       = await models.MTokenAccount.get_or_create(
                    m_token = m_token,
                    user    = to_user
                )
                to_account.rewards_earned += (token_reward_index - to_account.reward_index) * to_account.balance
                to_account.balance      = float(user_ledger[to_address])
                to_account.reward_index = float(reward_index_ledger[to_address])
                await to_account.save()
    
                to_account_history_data   = models.MTokenAccountHistoryData(
                    timestamp       = timestamp,
                    level           = level,
                    operation_hash  = operation_hash,
                    type            = models.MTokenOperationType.TRANSFER,
                    m_token_account = to_account,
                    balance         = to_account.balance,
                    reward_index    = to_account.reward_index,
                    rewards_earned  = to_account.rewards_earned
                )
                await to_account_history_data.save()

    except BaseException as e:
         await save_error_report(e)

