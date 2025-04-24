from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.m_token.tezos_parameters.compound import CompoundParameter
from maven.types.m_token.tezos_storage import MTokenStorage
from maven import models as models
from maven.utils.error_reporting import save_error_report

async def compound(
    ctx: HandlerContext,
    compound: TezosTransaction[CompoundParameter, MTokenStorage],
) -> None:

    try:
        # Get transfer batch
        user_addresses              = compound.parameter.root
        m_token_address             = compound.data.target_address
        user_ledger                 = compound.storage.ledger
        reward_index_ledger         = compound.storage.rewardIndexLedger
        token_reward_index          = float(compound.storage.tokenRewardIndex)
        total_supply                = float(compound.storage.totalSupply)

        # Update mToken record
        token                       = await models.Token.get(
            network         = 'atlasnet',
            token_address   = m_token_address,
            token_id        = 0
        )
        m_token                     = await models.MToken.get(network='atlasnet', address=m_token_address, token=token)
        m_token.token_reward_index  = token_reward_index
        m_token.total_supply        = total_supply
        await m_token.save()

        # Update users
        for user_address in user_addresses:
            user                        = await models.get_user(network='atlasnet', address=user_address)
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
