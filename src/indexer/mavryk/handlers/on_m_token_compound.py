from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.m_token.parameter.compound import CompoundParameter
from mavryk.types.m_token.storage import MTokenStorage
import mavryk.models as models


async def on_m_token_compound(
    ctx: HandlerContext,
    compound: Transaction[CompoundParameter, MTokenStorage],
) -> None:

    try:
        # Get transfer batch
        user_addresses              = compound.parameter.__root__
        m_token_address             = compound.data.target_address
        user_ledger                 = compound.storage.ledger
        reward_index_ledger         = compound.storage.rewardIndexLedger
        token_reward_index          = float(compound.storage.tokenRewardIndex)
        total_supply                = float(compound.storage.totalSupply)

        # Update mToken record
        token                       = await models.Token.get(
            network         = ctx.datasource.network,
            token_address   = m_token_address,
            token_id        = 0
        )
        m_token                     = await models.MToken.get(network=ctx.datasource.network, address=m_token_address, token=token)
        m_token.token_reward_index  = token_reward_index
        m_token.total_supply        = total_supply
        await m_token.save()

        # Update users
        for user_address in user_addresses:
            user                        = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=user_address)
            user_account, _             = await models.MTokenAccount.get_or_create(
                m_token = m_token,
                user    = user
            )
            user_account.rewards_earned += (token_reward_index - user_account.reward_index) * user_account.balance
            user_account.balance        = float(user_ledger[user_address])
            user_account.reward_index   = float(reward_index_ledger[user_address])
            await user_account.save()

    except BaseException as e:
         await save_error_report(e)
