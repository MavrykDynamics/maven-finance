
from mavryk.types.token_pool_reward.storage import TokenPoolRewardStorage
from mavryk.types.token_pool_reward.parameter.claim_rewards import ClaimRewardsParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
import mavryk.models as models

async def on_token_pool_reward_claim_rewards(
    ctx: HandlerContext,
    claim_rewards: Transaction[ClaimRewardsParameter, TokenPoolRewardStorage],
) -> None:
    
    # Get operation info
    token_pool_reward_address   = claim_rewards.data.target_address
    governance_address          = claim_rewards.storage.governanceAddress
    reward_ledger_storage       = claim_rewards.storage.rewardsLedger
    user_address                = claim_rewards.parameter.__root__

    # Create / Update record
    token_pool_reward           = await models.TokenPoolReward.get(
        address     = token_pool_reward_address
    )
    user, _                     = await models.MavrykUser.get_or_create(
        address     = user_address
    )
    await user.save()
    governance                  = await models.Governance.get(
        address     = governance_address
    )
    lending_controller          = await models.LendingController.get_or_none(
        governance  = governance
    )

    if lending_controller:
        for reward_record_storage in reward_ledger_storage:
            if reward_record_storage.key.address == user_address:
                # Get rewards attributes
                unpaid                  = float(reward_record_storage.value.unpaid)
                paid                    = float(reward_record_storage.value.paid)
                rewards_per_share       = float(reward_record_storage.value.rewardsPerShare)
                loan_token_name         = reward_record_storage.key.string
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
