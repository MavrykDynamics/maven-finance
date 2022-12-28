from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.m_token.parameter.transfer import TransferParameter
from mavryk.types.m_token.storage import MTokenStorage
import mavryk.models as models


async def on_m_token_transfer(
    ctx: HandlerContext,
    transfer: Transaction[TransferParameter, MTokenStorage],
) -> None:

    # Get transfer batch
    transaction_batch           = transfer.parameter.__root__
    m_token_address             = transfer.data.target_address
    user_ledger                 = transfer.storage.ledger
    reward_index_ledger         = transfer.storage.rewardIndexLedger
    token_reward_index          = float(transfer.storage.tokenRewardIndex)
    # Get MVK Token
    m_token                     = await models.MToken.get(address=m_token_address)
    m_token.token_reward_index  = token_reward_index
    await m_token.save()

    for entry in transaction_batch:
        from_address            = entry.from_
        transactions            = entry.txs

        # Get or create from
        from_user               = await models.mavryk_user_cache.get(address=from_address)
        from_account, _         = await models.MTokenAccount.get_or_create(
            m_token = m_token,
            user    = from_user
        )
        from_account.rewards_earned += (token_reward_index - from_account.reward_index) * from_account.balance
        from_account.balance        = float(user_ledger[from_address])
        from_account.reward_index   = float(reward_index_ledger[from_address])
        await from_account.save()

        for transaction in transactions:
            to_address          = transaction.to_

            # Get or create to
            to_user             = await models.mavryk_user_cache.get(address=to_address)
            to_account, _       = await models.MTokenAccount.get_or_create(
                m_token = m_token,
                user    = to_user
            )
            to_account.rewards_earned += (token_reward_index - to_account.reward_index) * to_account.balance
            to_account.balance      = float(user_ledger[to_address])
            to_account.reward_index = float(reward_index_ledger[to_address])
            await to_account.save()
