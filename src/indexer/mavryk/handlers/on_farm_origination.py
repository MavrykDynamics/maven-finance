from dipdup.models import Origination
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage, TokenStandardItem as fa12, TokenStandardItem1 as fa2
import mavryk.models as models

async def on_farm_origination(
    ctx: HandlerContext,
    farm_origination: Origination[FarmStorage],
) -> None:

    # Get operation info
    farm_address                    = farm_origination.data.originated_contract_address
    admin                           = farm_origination.storage.admin
    governance_address              = farm_origination.storage.governanceAddress
    lp_token_address                = farm_origination.storage.config.lpToken.tokenAddress
    lp_token_balance                = int(farm_origination.storage.config.lpToken.tokenBalance)
    lp_token_id                     = int(farm_origination.storage.config.lpToken.tokenId)
    lp_token_standard               = farm_origination.storage.config.lpToken.tokenStandard
    open                            = farm_origination.storage.open
    init                            = farm_origination.storage.init
    init_block                      = int(farm_origination.storage.initBlock)
    last_block_update               = int(farm_origination.storage.lastBlockUpdate)
    accumulated_rewards_per_share   = float(farm_origination.storage.accumulatedRewardsPerShare)
    total_blocks                    = int(farm_origination.storage.config.plannedRewards.totalBlocks)
    current_reward_per_block        = float(farm_origination.storage.config.plannedRewards.currentRewardPerBlock)
    total_rewards                   = float(farm_origination.storage.config.plannedRewards.totalRewards)
    unpaid_rewards                  = float(farm_origination.storage.claimedRewards.unpaid)
    paid_rewards                    = float(farm_origination.storage.claimedRewards.paid)
    blocks_per_minute               = int(farm_origination.storage.config.blocksPerMinute)
    infinite                        = farm_origination.storage.config.infinite
    deposit_paused                  = farm_origination.storage.breakGlassConfig.depositIsPaused
    withdraw_paused                 = farm_origination.storage.breakGlassConfig.withdrawIsPaused
    claim_paused                    = farm_origination.storage.breakGlassConfig.claimIsPaused
    force_rewards_from_transfer     = farm_origination.storage.config.forceRewardFromTransfer

    # Token standard
    lp_token_standard_type  = models.TokenType.OTHER
    if lp_token_standard == fa2:
        lp_token_standard_type  = models.TokenType.FA2
    elif lp_token_standard == fa12:
        lp_token_standard_type  = models.TokenType.FA12
    
    governance, _      = await models.Governance.get_or_create(
        address = governance_address
    )
    await governance.save()
    farm, _         = await models.Farm.get_or_create(
        address     = farm_address,
        admin       = admin,
        governance  = governance
    )
    farm.blocks_per_minute               = blocks_per_minute
    farm.force_rewards_from_transfer     = force_rewards_from_transfer
    farm.infinite                        = infinite
    farm.lp_token_address                = lp_token_address
    farm.lp_token_id                     = lp_token_id
    farm.lp_token_standard               = lp_token_standard_type
    farm.lp_token_balance                = lp_token_balance
    farm.total_blocks                    = total_blocks
    farm.current_reward_per_block        = current_reward_per_block
    farm.total_rewards                   = total_rewards
    farm.deposit_paused                  = deposit_paused
    farm.withdraw_paused                 = withdraw_paused
    farm.claim_paused                    = claim_paused
    farm.last_block_update               = last_block_update
    farm.open                            = open
    farm.init                            = init
    farm.init_block                      = init_block
    farm.accumulated_rewards_per_share   = accumulated_rewards_per_share
    farm.unpaid_rewards                  = unpaid_rewards
    farm.paid_rewards                    = paid_rewards
    await farm.save()