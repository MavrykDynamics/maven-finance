
from mavryk.types.farm_factory.parameter.create_farm import CreateFarmParameter
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from mavryk.types.farm.storage import FarmStorage, TokenStandardItem as fa12, TokenStandardItem1 as fa2
from dipdup.models import Origination
import mavryk.models as models

async def on_farm_factory_create_farm(
    ctx: HandlerContext,
    create_farm: Transaction[CreateFarmParameter, FarmFactoryStorage],
    farm_origination: Origination[FarmStorage],
) -> None:

    # Get operation info
    farm_address                    = farm_origination.data.originated_contract_address
    farm_factory_address            = create_farm.data.target_address
    admin                           = farm_origination.storage.admin
    governance_address              = farm_origination.storage.governanceAddress
    name                            = farm_origination.storage.name
    creation_timestamp              = farm_origination.data.timestamp
    blocks_per_minute               = int(farm_origination.storage.config.blocksPerMinute)
    force_rewards_from_transfer     = farm_origination.storage.config.forceRewardFromTransfer
    infinite                        = farm_origination.storage.config.infinite
    lp_token_address                = farm_origination.storage.config.lpToken.tokenAddress
    lp_token_id                     = int(farm_origination.storage.config.lpToken.tokenId)
    lp_token_standard               = farm_origination.storage.config.lpToken.tokenStandard
    lp_token_balance                = int(farm_origination.storage.config.lpToken.tokenBalance)
    total_blocks                    = int(farm_origination.storage.config.plannedRewards.totalBlocks)
    current_reward_per_block        = int(farm_origination.storage.config.plannedRewards.currentRewardPerBlock)
    total_rewards                   = int(farm_origination.storage.config.plannedRewards.totalRewards)
    deposit_paused                  = farm_origination.storage.breakGlassConfig.depositIsPaused
    withdraw_paused                 = farm_origination.storage.breakGlassConfig.withdrawIsPaused
    claim_paused                    = farm_origination.storage.breakGlassConfig.claimIsPaused
    last_block_update               = int(farm_origination.storage.lastBlockUpdate)
    open                            = farm_origination.storage.open
    init                            = farm_origination.storage.init
    init_block                      = int(farm_origination.storage.initBlock)
    accumulated_rewards_per_share   = float(farm_origination.storage.accumulatedRewardsPerShare)
    unpaid_rewards                  = float(farm_origination.storage.claimedRewards.unpaid)
    paid_rewards                    = float(farm_origination.storage.claimedRewards.paid)

    # Token standard
    lp_token_standard_type  = models.TokenType.OTHER
    if type(lp_token_standard) == fa2:
        lp_token_standard_type  = models.TokenType.FA2
    elif type(lp_token_standard) == fa12:
        lp_token_standard_type  = models.TokenType.FA12

    # Create a contract and index it
    await ctx.add_contract(
        name=farm_address + 'contract',
        address=farm_address,
        typename="farm"
    )
    await ctx.add_index(
        name=farm_address + 'index',
        template="farm_template",
        values=dict(
            farm_contract=farm_address + 'contract'
        )
    )

    # Create record
    farm_factory    = await models.FarmFactory.get(
        address = farm_factory_address
    )
    governance      = await models.Governance.get(
        address = governance_address
    )
    farm, _         = await models.Farm.get_or_create(
        address     = farm_address,
        admin       = admin,
        governance  = governance
    )
    farm.name                            = name
    farm.creation_timestamp              = creation_timestamp 
    farm.farm_factory                    = farm_factory
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
