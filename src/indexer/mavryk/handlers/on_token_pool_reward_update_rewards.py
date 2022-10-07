
from mavryk.types.token_pool_reward.storage import TokenPoolRewardStorage
from mavryk.types.token_pool_reward.parameter.update_rewards import UpdateRewardsParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
import mavryk.models as models

async def on_token_pool_reward_update_rewards(
    ctx: HandlerContext,
    update_rewards: Transaction[UpdateRewardsParameter, TokenPoolRewardStorage],
) -> None:
    
    # Get operation info
    token_pool_reward_address   = update_rewards.data.target_address
    lending_controller_address  = update_rewards.data.sender_address
    user_address                = update_rewards.parameter.userAddress
    loan_token_name             = update_rewards.parameter.loanTokenName
    reward_ledger_storage       = update_rewards.storage.rewardsLedger

    # Create / Update record
    token_pool_reward           = await models.TokenPoolReward.get(
        address     = token_pool_reward_address
    )
    user, _                     = await models.MavrykUser.get_or_create(
        address     = user_address
    )
    lending_controller          = await models.LendingController.get_or_none(
        address     = lending_controller_address 
    )
    if lending_controller:
        await user.save()
        for reward_record_storage in reward_ledger_storage:
            # Get rewards attributes
            unpaid                  = float(reward_record_storage.value.unpaid)
            paid                    = float(reward_record_storage.value.paid)
            rewards_per_share       = float(reward_record_storage.value.rewardsPerShare)
            loan_token, _           = await models.LendingControllerLoanToken.get_or_create(
                lending_controller  = lending_controller,
                loan_token_name     = loan_token_name
            )
            await loan_token.save()

            # Save token pool reward
            token_pool_reward_reward, _ = await models.TokenPoolRewardReward.get_or_create(
                token_pool_reward               = token_pool_reward,
                user                            = user,
                lending_controller_loan_token   = loan_token
            )
            token_pool_reward_reward.unpaid             = unpaid
            token_pool_reward_reward.paid               = paid
            token_pool_reward_reward.rewards_per_share  = rewards_per_share
            await token_pool_reward_reward.save()
