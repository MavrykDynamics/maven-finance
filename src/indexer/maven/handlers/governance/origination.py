from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosOrigination
from maven import models as models
from maven.types.governance.tezos_storage import GovernanceStorage, Round as proposal, Round1 as timelock, Round2 as voting
from maven.types.governance.tezos_storage import GovernanceStorage
from maven.utils.contracts import get_contract_metadata
from maven.utils.error_reporting import save_error_report

async def origination(
    ctx: HandlerContext,
    governance_origination: TezosOrigination[GovernanceStorage],
) -> None:
    try:
        # Get operation values
        address                                 = governance_origination.data.originated_contract_address
        admin                                   = governance_origination.storage.admin
        governance_proxy_address                = governance_origination.storage.governanceProxyAddress
        success_reward                          = float(governance_origination.storage.config.successReward)
        cycle_voters_reward                     = float(governance_origination.storage.config.cycleVotersReward)
        proposal_round_vote_percentage          = int(governance_origination.storage.config.minProposalRoundVotePercentage)
        min_quorum_percentage                   = int(governance_origination.storage.config.minQuorumPercentage)
        min_yay_vote_percentage                 = int(governance_origination.storage.config.minYayVotePercentage)
        proposal_submission_fee                 = int(governance_origination.storage.config.proposalSubmissionFeeMumav)
        max_proposals_per_delegate              = int(governance_origination.storage.config.maxProposalsPerSatellite)
        blocks_per_Proposal_round               = int(governance_origination.storage.config.blocksPerProposalRound)
        blocks_per_voting_round                 = int(governance_origination.storage.config.blocksPerVotingRound)
        blocks_per_timelock_round               = int(governance_origination.storage.config.blocksPerTimelockRound)
        proposal_metadata_title_max_length      = int(governance_origination.storage.config.proposalDataTitleMaxLength)
        proposal_title_max_length               = int(governance_origination.storage.config.proposalTitleMaxLength)
        proposal_description_max_length         = int(governance_origination.storage.config.proposalDescriptionMaxLength)
        proposal_invoice_max_length             = int(governance_origination.storage.config.proposalInvoiceMaxLength)
        proposal_source_code_max_length         = int(governance_origination.storage.config.proposalSourceCodeMaxLength)
        current_round                           = governance_origination.storage.currentCycleInfo.round
        current_blocks_per_proposal_round       = int(governance_origination.storage.currentCycleInfo.blocksPerProposalRound)
        current_blocks_per_voting_round         = int(governance_origination.storage.currentCycleInfo.blocksPerVotingRound)
        current_blocks_per_timelock_round       = int(governance_origination.storage.currentCycleInfo.blocksPerTimelockRound)
        current_round_start_level               = int(governance_origination.storage.currentCycleInfo.roundStartLevel)
        current_round_end_level                 = int(governance_origination.storage.currentCycleInfo.roundEndLevel)
        current_cycle_end_level                 = int(governance_origination.storage.currentCycleInfo.cycleEndLevel)
        current_cycle_total_voters_reward       = int(governance_origination.storage.currentCycleInfo.cycleTotalVotersReward)
        next_proposal_id                        = int(governance_origination.storage.nextProposalId)
        cycle_id                                = int(governance_origination.storage.cycleId)
        cycle_highest_voted_proposal_id         = int(governance_origination.storage.cycleHighestVotedProposalId )
        timelock_proposal_id                    = int(governance_origination.storage.timelockProposalId)
        whitelisted_developers                  = governance_origination.storage.whitelistDevelopers
        timestamp                               = governance_origination.data.timestamp
    
        # Get contract metadata
        contract_metadata = await get_contract_metadata(
            ctx=ctx,
            contract_address=address
        )
        
        # Current round
        governance_round_type = models.GovernanceRoundType.PROPOSAL
        if type(current_round) == proposal:
            governance_round_type = models.GovernanceRoundType.PROPOSAL
        elif type(current_round) == timelock:
            governance_round_type = models.GovernanceRoundType.TIMELOCK
        elif type(current_round) == voting:
            governance_round_type = models.GovernanceRoundType.VOTING

        # Create hypertables
        #ctx.execute_sql_script('create_distributed_hypertables')
    
        # Create record
        governance          = models.Governance(
            address                                 = address,
            network                                 = 'atlasnet',
            metadata                                = contract_metadata,
            admin                                   = admin,
            last_updated_at                         = timestamp,
            governance_proxy_address                = governance_proxy_address,
            success_reward                          = success_reward,
            cycle_voters_reward                     = cycle_voters_reward,
            proposal_round_vote_percentage          = proposal_round_vote_percentage,
            min_quorum_percentage                   = min_quorum_percentage,
            min_yay_vote_percentage                 = min_yay_vote_percentage,
            proposal_submission_fee_mumav           = proposal_submission_fee,
            max_proposal_per_satellite              = max_proposals_per_delegate,
            blocks_per_proposal_round               = blocks_per_Proposal_round,
            blocks_per_voting_round                 = blocks_per_voting_round,
            blocks_per_timelock_round               = blocks_per_timelock_round,
            proposal_metadata_title_max_length      = proposal_metadata_title_max_length,
            proposal_title_max_length               = proposal_title_max_length,
            proposal_description_max_length         = proposal_description_max_length,
            proposal_invoice_max_length             = proposal_invoice_max_length,
            proposal_source_code_max_length         = proposal_source_code_max_length,
            current_round                           = governance_round_type,
            current_blocks_per_proposal_round       = current_blocks_per_proposal_round,
            current_blocks_per_voting_round         = current_blocks_per_voting_round,
            current_blocks_per_timelock_round       = current_blocks_per_timelock_round,
            current_round_start_level               = current_round_start_level,
            current_round_end_level                 = current_round_end_level,
            current_cycle_end_level                 = current_cycle_end_level,
            current_cycle_total_voters_reward       = current_cycle_total_voters_reward,
            next_proposal_id                        = next_proposal_id,
            cycle_id                                = cycle_id,
            cycle_highest_voted_proposal_id         = cycle_highest_voted_proposal_id ,
            timelock_proposal_id                    = timelock_proposal_id
        )
        await governance.save()
    
        # Add whitelisted developers
        for whitelisted_developer_address in whitelisted_developers:
            user                                    = await models.get_user(network='atlasnet', address=whitelisted_developer_address)
            whitelist_developer, _                  = await models.WhitelistDeveloper.get_or_create(
                governance  = governance,
                developer   = user
            )
            await whitelist_developer.save()

        # Start the snapshot indexing
        await ctx.add_index(
            name="governance_satellite_snapshot",
            template="governance_satellite_snapshot_template",
            values=dict(
                governance_contract="governance"
            )
        )

        # Start the MToken indexing
        await ctx.add_index(
            name="m_token_mvrk",
            template="m_token_template",
            values=dict(
                m_token_contract="m_token_mvrk"
            )
        )
        # await ctx.add_index(
        #     name="m_token_eurt",
        #     template="m_token_template",
        #     values=dict(
        #         m_token_contract="m_token_eurt"
        #     )
        # )
        # await ctx.add_index(
        #     name="m_token_wbtc",
        #     template="m_token_template",
        #     values=dict(
        #         m_token_contract="m_token_wbtc"
        #     )
        # )
        await ctx.add_index(
            name="m_token_usdt",
            template="m_token_template",
            values=dict(
                m_token_contract="m_token_usdt"
            )
        )

        # Start Maven Finance indexer
        await ctx.add_index(
            name="maven_finance",
            template="maven_finance_template",
            values=dict(
                governance_contract="governance",
                governance_proxy_contract="governance_proxy",
                mvn_token_contract="mvn_token",
                # mvn_faucet_contract="mvn_faucet",
                doorman_contract="doorman",
                farm_factory_contract="farm_factory",
                delegation_contract="delegation",
                vesting_contract="vesting",
                emergency_governance_contract="emergency_governance",
                council_contract="council",
                break_glass_contract="break_glass",
                governance_financial_contract="governance_financial",
                governance_satellite_contract="governance_satellite",
                aggregator_factory_contract="aggregator_factory",
                treasury_factory_contract="treasury_factory",
                vault_factory_contract="vault_factory",
                lending_controller_contract="lending_controller",
                # lending_controller_mock_time_contract="lending_controller_mock_time"
            )
        )

    except BaseException as e:
        await save_error_report(e)
