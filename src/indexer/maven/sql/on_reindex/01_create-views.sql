-- Create regular view for loan tokens (optimized)
DROP VIEW IF EXISTS loan_token_view CASCADE;
CREATE OR REPLACE VIEW loan_token_view AS
WITH depositor_counts AS (
    SELECT
        mt.id as m_token_id,
        COUNT(DISTINCT mta.user_id) FILTER (WHERE mta.balance > 0) as depositors_count,
        COALESCE(SUM(mta.rewards_earned), 0) as rewards_earned_total
    FROM
        m_token mt
        LEFT JOIN m_token_account mta ON mt.id = mta.m_token_id
    GROUP BY
        mt.id
),
borrower_counts AS (
    SELECT
        lcv.loan_token_id,
        COUNT(DISTINCT lcv.owner_id) FILTER (WHERE lcv.loan_outstanding_total > 0) as borrowers_count
    FROM
        lending_controller_vault lcv
    GROUP BY
        lcv.loan_token_id
)
SELECT 
    lt.id,
    lt.lending_controller_id,
    lt.token_id,
    lt.m_token_id,
    lt.loan_token_name,
    tk.token_address,
    mt.address as m_token_address,
    lt.token_pool_total,
    lt.total_borrowed,
    lt.total_remaining,
    lt.utilisation_rate,
    lt.current_interest_rate,
    COALESCE(dc.depositors_count, 0) as depositors_count,
    COALESCE(bc.borrowers_count, 0) as borrowers_count,
    COALESCE(dc.rewards_earned_total, 0) as rewards_earned_total,
    lt.paused,
    NOW() as last_updated
FROM 
    lending_controller_loan_token lt
    JOIN token tk ON lt.token_id = tk.id
    JOIN m_token mt ON lt.m_token_id = mt.id
    LEFT JOIN depositor_counts dc ON lt.m_token_id = dc.m_token_id
    LEFT JOIN borrower_counts bc ON lt.id = bc.loan_token_id;

-- Create regular view for vault collateral (optimized)
DROP VIEW IF EXISTS vault_collateral_view CASCADE;
CREATE OR REPLACE VIEW vault_collateral_view AS
SELECT 
    ROW_NUMBER() OVER () as id,
    v.id as vault_id,
    v.address as vault_address,
    lcv.id as lending_controller_vault_id,
    lccb.collateral_token_id,
    lct.token_id,
    tk.token_address,
    lct.token_name as collateral_token_name,
    lccb.balance,
    lcv.owner_id,
    mu.address as owner_address,
    lcv.loan_outstanding_total,
    NOW() as last_updated
FROM 
    lending_controller_vault_collateral_balance lccb
    JOIN lending_controller_vault lcv ON lccb.lending_controller_vault_id = lcv.id
    JOIN vault v ON lcv.vault_id = v.id
    JOIN lending_controller_collateral_token lct ON lccb.collateral_token_id = lct.id
    JOIN token tk ON lct.token_id = tk.id
    JOIN maven_user mu ON lcv.owner_id = mu.id;

-- Create regular view for TVL calculations (optimized)
DROP VIEW IF EXISTS tvl_stats CASCADE;
CREATE OR REPLACE VIEW tvl_stats AS
SELECT 
    ROW_NUMBER() OVER () as id,
    tk.token_address,
    lt.token_pool_total,
    lt.total_borrowed,
    NOW() as last_updated
FROM 
    lending_controller_loan_token lt
    JOIN token tk ON lt.token_id = tk.id;

-- Create regular view for user dashboard (optimized)
DROP VIEW IF EXISTS user_dashboard CASCADE;
CREATE OR REPLACE VIEW user_dashboard AS
WITH user_vaults AS (
    SELECT
        mu.id as user_id,
        mu.address as user_address,
        COUNT(DISTINCT v.id) as vaults_count,
        COUNT(DISTINCT lcv.id) FILTER (WHERE lcv.open = true) as active_vaults_count,
        COALESCE(SUM(lcv.loan_outstanding_total), 0) as total_borrowed
    FROM
        maven_user mu
        LEFT JOIN lending_controller_vault lcv ON mu.id = lcv.owner_id
        LEFT JOIN vault v ON lcv.vault_id = v.id
    GROUP BY
        mu.id, mu.address
),
user_tokens AS (
    SELECT
        mta.user_id,
        jsonb_object_agg(
            mt.address,
            jsonb_build_object(
                'm_token_address', mt.address,
                'balance', mta.balance,
                'rewards_earned', mta.rewards_earned
            )
        ) as m_tokens
    FROM 
        m_token_account mta 
        JOIN m_token mt ON mta.m_token_id = mt.id
    WHERE 
        mta.balance > 0
    GROUP BY 
        mta.user_id
)
SELECT
    uv.user_id,
    uv.user_address,
    uv.vaults_count,
    uv.active_vaults_count,
    uv.total_borrowed,
    COALESCE(ut.m_tokens, '{{}}'::jsonb) as m_tokens,
    NOW() as last_updated
FROM
    user_vaults uv
    LEFT JOIN user_tokens ut ON uv.user_id = ut.user_id;

-- Create satellite metrics view (detailed)
DROP VIEW IF EXISTS satellite_metrics_view CASCADE;
CREATE OR REPLACE VIEW satellite_metrics_view AS
WITH active_satellites AS (
    -- Get active satellites (status = 0 = ACTIVE, currently_registered = true)
    SELECT 
        s.id,
        s.user_id,
        s.delegation_id,
        s.fee,
        s.total_delegated_amount,
        s.status,
        s.currently_registered,
        mu.smvn_balance as user_smvn_balance,
        mu.mvn_balance as user_mvn_balance,
        d.delegation_ratio
    FROM 
        satellite s
        JOIN maven_user mu ON s.user_id = mu.id
        JOIN delegation d ON s.delegation_id = d.id
    WHERE 
        s.status = 0  -- ACTIVE status
        AND s.currently_registered = true
),
satellite_delegation_counts AS (
    -- Count delegations per satellite
    SELECT 
        s.id as satellite_id,
        COUNT(dr.id) as delegation_count
    FROM 
        satellite s
        LEFT JOIN delegation_record dr ON s.id = dr.satellite_id
    WHERE 
        s.status = 0  -- ACTIVE status
        AND s.currently_registered = true
    GROUP BY 
        s.id
),
satellite_governance_participation AS (
    -- Calculate voting participation for governance proposals (group by proposal ID to count each proposal only once)
    SELECT 
        s.id as satellite_id,
        COUNT(DISTINCT gpv.governance_proposal_id) as proposals_voted_on
    FROM 
        satellite s
        LEFT JOIN governance_proposal_vote gpv ON s.user_id = gpv.voter_id
    WHERE 
        s.status = 0  -- ACTIVE status
        AND s.currently_registered = true
    GROUP BY 
        s.id
),
satellite_financial_participation AS (
    -- Calculate voting participation for governance financial requests (group by request ID to count each request only once)
    SELECT 
        s.id as satellite_id,
        COUNT(DISTINCT gfrv.governance_financial_request_id) as financial_requests_voted_on
    FROM 
        satellite s
        LEFT JOIN governance_financial_request_vote gfrv ON s.user_id = gfrv.voter_id
    GROUP BY 
        s.id
),
satellite_action_participation AS (
    -- Calculate voting participation for governance satellite actions (group by action ID to count each action only once)
    SELECT 
        s.id as satellite_id,
        COUNT(DISTINCT gsav.governance_satellite_action_id) as satellite_actions_voted_on
    FROM 
        satellite s
        LEFT JOIN governance_satellite_action_vote gsav ON s.user_id = gsav.voter_id
    GROUP BY 
        s.id
),
governance_counters AS (
    -- Get total counts from actual database records
    SELECT 
        (SELECT COUNT(DISTINCT id) FROM governance_proposal) as total_proposals_created,
        (SELECT COUNT(DISTINCT id) FROM governance_satellite_action) as total_satellite_actions_created,
        (SELECT COUNT(DISTINCT id) FROM governance_financial_request) as total_financial_requests_created
),
satellite_metrics AS (
    SELECT 
        sat.id,
        sat.user_id,
        sat.delegation_id,
        sat.fee,
        sat.total_delegated_amount,
        sat.user_smvn_balance,
        sat.user_mvn_balance,
        sat.delegation_ratio,
        COALESCE(sdc.delegation_count, 0) as delegation_count,
        COALESCE(sgp.proposals_voted_on, 0) as proposals_voted_on,
        COALESCE(sfp.financial_requests_voted_on, 0) as financial_requests_voted_on,
        COALESCE(sap.satellite_actions_voted_on, 0) as satellite_actions_voted_on,
        GREATEST(
            CASE 
                WHEN sat.delegation_ratio = 0 THEN sat.user_smvn_balance * 10000
                ELSE sat.user_smvn_balance * 10000 / sat.delegation_ratio
            END - (sat.user_smvn_balance + sat.total_delegated_amount),
            0
        ) as free_smvn_balance,
        -- Calculate participation rate based on governance contract counters (scaled to 0-10000 like delegation fee)
        CASE 
            WHEN (gc.total_proposals_created + gc.total_financial_requests_created + gc.total_satellite_actions_created) > 0 
            THEN (
                (COALESCE(sgp.proposals_voted_on, 0) + COALESCE(sfp.financial_requests_voted_on, 0) + COALESCE(sap.satellite_actions_voted_on, 0))::float / 
                (gc.total_proposals_created + gc.total_financial_requests_created + gc.total_satellite_actions_created)::float
            ) * 10000
            ELSE 0 
        END as participation_rate
    FROM 
        active_satellites sat
        LEFT JOIN satellite_delegation_counts sdc ON sat.id = sdc.satellite_id
        LEFT JOIN satellite_governance_participation sgp ON sat.id = sgp.satellite_id
        LEFT JOIN satellite_financial_participation sfp ON sat.id = sfp.satellite_id
        LEFT JOIN satellite_action_participation sap ON sat.id = sap.satellite_id
        CROSS JOIN governance_counters gc
),
aggregate_metrics AS (
    SELECT 
        COUNT(*) as total_active_satellites,
        AVG(total_delegated_amount) as avg_delegated_smvn,
        AVG(free_smvn_balance) as avg_free_smvn_balance,
        AVG(fee) as avg_delegation_fee,
        AVG(user_mvn_balance) as avg_mvn_staked,
        AVG(participation_rate) as avg_participation_rate,
        SUM(total_delegated_amount) as total_delegated_smvn,
        SUM(free_smvn_balance) as total_free_smvn_balance,
        SUM(user_mvn_balance) as total_mvn_staked,
        SUM(delegation_count) as total_delegations,
        SUM(proposals_voted_on + financial_requests_voted_on + satellite_actions_voted_on) as total_votes_cast
    FROM 
        satellite_metrics
)
SELECT 
    -- Individual satellite metrics
    sm.id as satellite_id,
    sm.user_id,
    sm.delegation_id,
    sm.fee as delegation_fee,
    sm.total_delegated_amount as delegated_smvn,
    sm.free_smvn_balance,
    sm.user_mvn_balance as mvn_staked,
    sm.delegation_ratio,
    sm.delegation_count,
    sm.proposals_voted_on,
    sm.financial_requests_voted_on,
    sm.satellite_actions_voted_on,
    sm.participation_rate,
    
    -- Aggregate metrics (same for all rows)
    am.total_active_satellites,
    am.avg_delegated_smvn,
    am.avg_free_smvn_balance,
    am.avg_delegation_fee,
    am.avg_mvn_staked,
    am.avg_participation_rate,
    am.total_delegated_smvn,
    am.total_free_smvn_balance,
    am.total_mvn_staked,
    am.total_delegations,
    am.total_votes_cast,
    
    -- Timestamp
    NOW() as last_updated
FROM 
    satellite_metrics sm
    CROSS JOIN aggregate_metrics am
ORDER BY 
    sm.total_delegated_amount DESC;

-- Create satellite summary view (aggregate metrics only)
DROP VIEW IF EXISTS satellite_summary_view CASCADE;
CREATE OR REPLACE VIEW satellite_summary_view AS
WITH active_satellites AS (
    -- Get active satellites (status = 0 = ACTIVE, currently_registered = true)
    SELECT 
        s.id,
        s.user_id,
        s.fee,
        s.total_delegated_amount,
        mu.smvn_balance as user_smvn_balance,
        mu.mvn_balance as user_mvn_balance,
        d.delegation_ratio
    FROM 
        satellite s
        JOIN maven_user mu ON s.user_id = mu.id
        JOIN delegation d ON s.delegation_id = d.id
    WHERE 
        s.status = 0  -- ACTIVE status
        AND s.currently_registered = true
),
satellite_governance_participation AS (
    -- Calculate voting participation for governance proposals (group by proposal ID to count each proposal only once)
    SELECT 
        s.id as satellite_id,
        COUNT(DISTINCT gpv.governance_proposal_id) as proposals_voted_on
    FROM 
        satellite s
        LEFT JOIN governance_proposal_vote gpv ON s.user_id = gpv.voter_id
    WHERE 
        s.status = 0  -- ACTIVE status
        AND s.currently_registered = true
    GROUP BY 
        s.id
),
satellite_financial_participation AS (
    -- Calculate voting participation for governance financial requests (group by request ID to count each request only once)
    SELECT 
        s.id as satellite_id,
        COUNT(DISTINCT gfrv.governance_financial_request_id) as financial_requests_voted_on
    FROM 
        satellite s
        LEFT JOIN governance_financial_request_vote gfrv ON s.user_id = gfrv.voter_id
    WHERE 
        s.status = 0  -- ACTIVE status
        AND s.currently_registered = true
    GROUP BY 
        s.id
),
satellite_action_participation AS (
    -- Calculate voting participation for governance satellite actions (group by action ID to count each action only once)
    SELECT 
        s.id as satellite_id,
        COUNT(DISTINCT gsav.governance_satellite_action_id) as satellite_actions_voted_on
    FROM 
        satellite s
        LEFT JOIN governance_satellite_action_vote gsav ON s.user_id = gsav.voter_id
    WHERE 
        s.status = 0  -- ACTIVE status
        AND s.currently_registered = true
    GROUP BY 
        s.id
),
governance_counters AS (
    -- Get total counts from actual database records
    SELECT 
        (SELECT COUNT(DISTINCT id) FROM governance_proposal) as total_proposals_created,
        (SELECT COUNT(DISTINCT id) FROM governance_satellite_action) as total_satellite_actions_created,
        (SELECT COUNT(DISTINCT id) FROM governance_financial_request) as total_financial_requests_created
),
satellite_metrics AS (
    SELECT 
        sat.id,
        sat.fee,
        sat.total_delegated_amount,
        GREATEST(
            CASE 
                WHEN sat.delegation_ratio = 0 THEN sat.user_smvn_balance * 10000
                ELSE sat.user_smvn_balance * 10000 / sat.delegation_ratio
            END - (sat.user_smvn_balance + sat.total_delegated_amount),
            0
        ) as free_smvn_balance,
        sat.user_mvn_balance,
        -- Calculate participation rate based on governance contract counters (scaled to 0-10000 like delegation fee)
        CASE 
            WHEN (gc.total_proposals_created + gc.total_financial_requests_created + gc.total_satellite_actions_created) > 0 
            THEN (
                (COALESCE(sgp.proposals_voted_on, 0) + COALESCE(sfp.financial_requests_voted_on, 0) + COALESCE(sap.satellite_actions_voted_on, 0))::float / 
                (gc.total_proposals_created + gc.total_financial_requests_created + gc.total_satellite_actions_created)::float
            ) * 10000
            ELSE 0 
        END as participation_rate
    FROM 
        active_satellites sat
        LEFT JOIN satellite_governance_participation sgp ON sat.id = sgp.satellite_id
        LEFT JOIN satellite_financial_participation sfp ON sat.id = sfp.satellite_id
        LEFT JOIN satellite_action_participation sap ON sat.id = sap.satellite_id
        CROSS JOIN governance_counters gc
)
SELECT 
    -- Aggregate metrics
    COUNT(*) as total_active_satellites,
    ROUND(CAST(AVG(total_delegated_amount) AS NUMERIC), 2) as avg_delegated_smvn,
    ROUND(CAST(AVG(free_smvn_balance) AS NUMERIC), 2) as avg_free_smvn_balance,
    ROUND(CAST(AVG(fee) AS NUMERIC), 2) as avg_delegation_fee,
    ROUND(CAST(AVG(user_mvn_balance) AS NUMERIC), 2) as avg_mvn_staked,
    ROUND(CAST(AVG(participation_rate) AS NUMERIC), 2) as avg_participation_rate,
    
    -- Additional context
    ROUND(CAST(SUM(total_delegated_amount) AS NUMERIC), 2) as total_delegated_smvn,
    ROUND(CAST(SUM(free_smvn_balance) AS NUMERIC), 2) as total_free_smvn_balance,
    ROUND(CAST(SUM(user_mvn_balance) AS NUMERIC), 2) as total_mvn_staked,
    
    -- Timestamp
    NOW() as last_updated
FROM 
    satellite_metrics;

-- Create comprehensive satellite data view
DROP VIEW IF EXISTS satellite_data_view CASCADE;
CREATE OR REPLACE VIEW satellite_data_view AS
WITH satellite_delegator_counts AS (
    -- Count delegators per satellite
    SELECT 
        s.id as satellite_id,
        COUNT(dr.id) as delegator_count
    FROM 
        satellite s
        LEFT JOIN delegation_record dr ON s.id = dr.satellite_id
    GROUP BY 
        s.id
),
satellite_governance_participation AS (
    -- Calculate voting participation for governance proposals (group by proposal ID to count each proposal only once)
    SELECT 
        s.id as satellite_id,
        COUNT(DISTINCT gpv.governance_proposal_id) as proposals_voted_on
    FROM 
        satellite s
        LEFT JOIN governance_proposal_vote gpv ON s.user_id = gpv.voter_id
    GROUP BY 
        s.id
),
satellite_financial_participation AS (
    -- Calculate voting participation for governance financial requests (group by request ID to count each request only once)
    SELECT 
        s.id as satellite_id,
        COUNT(DISTINCT gfrv.governance_financial_request_id) as financial_requests_voted_on
    FROM 
        satellite s
        LEFT JOIN governance_financial_request_vote gfrv ON s.user_id = gfrv.voter_id
    GROUP BY 
        s.id
),
satellite_action_participation AS (
    -- Calculate voting participation for governance satellite actions (group by action ID to count each action only once)
    SELECT 
        s.id as satellite_id,
        COUNT(DISTINCT gsav.governance_satellite_action_id) as satellite_actions_voted_on
    FROM 
        satellite s
        LEFT JOIN governance_satellite_action_vote gsav ON s.user_id = gsav.voter_id
    GROUP BY 
        s.id
),
governance_counters AS (
    -- Get total counts from actual database records
    SELECT 
        (SELECT COUNT(DISTINCT id) FROM governance_proposal) as total_proposals_created,
        (SELECT COUNT(DISTINCT id) FROM governance_satellite_action) as total_satellite_actions_created,
        (SELECT COUNT(DISTINCT id) FROM governance_financial_request) as total_financial_requests_created
),
satellite_rewards AS (
    -- Calculate SMVN and MVRK rewards for satellite oracles from aggregator_oracle_reward table
    SELECT 
        ao.user_id,
        SUM(CASE WHEN aor.type = 1 THEN aor.reward ELSE 0 END) as smvn_rewards_total,
        SUM(CASE WHEN aor.type = 0 THEN aor.reward ELSE 0 END) as mvrk_rewards_total
    FROM 
        aggregator_oracle ao
        LEFT JOIN aggregator_oracle_reward aor ON ao.id = aor.oracle_id
    GROUP BY 
        ao.user_id
),
satellite_feeds_observations AS (
    -- Count total observations across all aggregators for a satellite
    SELECT 
        ao.user_id,
        COUNT(aoo.id) as total_observations_count
    FROM 
        aggregator_oracle ao
        LEFT JOIN aggregator_oracle_observation aoo ON ao.id = aoo.oracle_id
    GROUP BY 
        ao.user_id
),
satellite_oracle_efficiency AS (
    -- Calculate oracle efficiency (participated_feeds)
    WITH oracle_latest_observations AS (
        -- For each oracle, get its latest observation
        SELECT DISTINCT ON (ao.id)
            ao.id as oracle_id,
            ao.user_id,
            ao.init_epoch,
            ao.init_round,
            aoo.epoch,
            aoo.round,
            aoo.timestamp
        FROM 
            aggregator_oracle ao
            LEFT JOIN aggregator_oracle_observation aoo ON ao.id = aoo.oracle_id
        WHERE 
            aoo.timestamp IS NOT NULL
        ORDER BY 
            ao.id, aoo.timestamp DESC
    ),
    latest_observations AS (
        -- Find the oracle with the latest observation for each user (matching JavaScript reduce logic)
        SELECT DISTINCT ON (olo.user_id)
            olo.user_id,
            olo.init_epoch,
            olo.init_round,
            olo.epoch,
            olo.round,
            olo.timestamp as latest_timestamp
        FROM 
            oracle_latest_observations olo
        ORDER BY 
            olo.user_id, olo.timestamp DESC
    ),
    total_observations AS (
        -- Get total observations count across ALL aggregators for each satellite
        SELECT 
            ao.user_id,
            COUNT(aoo.id) as total_feeds_observation
        FROM 
            aggregator_oracle ao
            LEFT JOIN aggregator_oracle_observation aoo ON ao.id = aoo.oracle_id
        GROUP BY 
            ao.user_id
    )
    SELECT 
        lo.user_id,
        -- Calculate prediction success ratio: (epoch / round) - (init_epoch / init_round)
        (lo.epoch::float / GREATEST(lo.round, 1)::float) - (lo.init_epoch::float / GREATEST(lo.init_round, 1)::float) as prediction_success_ratio,
        COALESCE(total_obs.total_feeds_observation, 0) as total_feeds_observation
    FROM 
        latest_observations lo
        LEFT JOIN total_observations total_obs ON lo.user_id = total_obs.user_id
),
satellite_last_observation AS (
    -- Get the last observation details for each satellite
    WITH oracle_latest_observations AS (
        -- For each oracle, get its latest observation with aggregator details
        SELECT DISTINCT ON (ao.id)
            ao.id as oracle_id,
            ao.user_id,
            aoo.epoch,
            aoo.round,
            aoo.timestamp,
            aoo.data,
            agg.address as aggregator_address
        FROM 
            aggregator_oracle ao
            LEFT JOIN aggregator_oracle_observation aoo ON ao.id = aoo.oracle_id
            LEFT JOIN aggregator agg ON ao.aggregator_id = agg.id
        WHERE 
            aoo.timestamp IS NOT NULL
        ORDER BY 
            ao.id, aoo.timestamp DESC
    )
    SELECT DISTINCT ON (olo.user_id)
        olo.user_id,
        olo.aggregator_address as last_observation_aggregator_address,
        olo.timestamp as last_observation_timestamp,
        olo.data as last_observation_data,
        olo.epoch as last_observation_epoch,
        olo.round as last_observation_round
    FROM 
        oracle_latest_observations olo
    ORDER BY 
        olo.user_id, olo.timestamp DESC
),
satellite_governance_counts AS (
    -- Count governance activities for satellites
    SELECT 
        s.user_id,
        COUNT(DISTINCT gp.id) as created_gov_proposals_count,
        COUNT(DISTINCT gfr.id) as created_fin_requests_count,
        COUNT(DISTINCT gsa.id) as created_satellite_gov_actions_count,
        COUNT(DISTINCT gpv.id) as gov_proposals_votes_count,
        COUNT(DISTINCT gfrv.id) as fin_requests_votes_count,
        COUNT(DISTINCT gsav.id) as satellite_gov_actions_votes_count
    FROM 
        satellite s
        LEFT JOIN governance_proposal gp ON s.user_id = gp.proposer_id
        LEFT JOIN governance_financial_request gfr ON s.user_id = gfr.requester_id
        LEFT JOIN governance_satellite_action gsa ON s.user_id = gsa.initiator_id
        LEFT JOIN governance_proposal_vote gpv ON s.user_id = gpv.voter_id
        LEFT JOIN governance_financial_request_vote gfrv ON s.user_id = gfrv.voter_id
        LEFT JOIN governance_satellite_action_vote gsav ON s.user_id = gsav.voter_id
    GROUP BY 
        s.user_id
),
latest_voting_power AS (
    -- Get latest voting power for satellites
    SELECT 
        gss.user_id,
        gss.total_voting_power
    FROM 
        governance_satellite_snapshot gss
        INNER JOIN (
            SELECT user_id, MAX(id) as max_id
            FROM governance_satellite_snapshot
            WHERE latest = true
            GROUP BY user_id
        ) latest ON gss.user_id = latest.user_id AND gss.id = latest.max_id
),
last_voted_proposal AS (
    -- Get the last voted proposal for each satellite
    SELECT DISTINCT ON (gpv.voter_id)
        gpv.voter_id,
        gpv.vote,
        gp.id as proposal_id,
        gp.title as proposal_title,
        gp.cycle as proposal_cycle,
        gp.current_round_proposal,
        g.cycle_id as governance_cycle_id
    FROM 
        governance_proposal_vote gpv
        JOIN governance_proposal gp ON gpv.governance_proposal_id = gp.id
        JOIN governance g ON gp.governance_id = g.id
    ORDER BY 
        gpv.voter_id, gpv.timestamp DESC
)
SELECT 
    -- Satellite basic information
    s.id as satellite_id,
    s.description,
    s.fee,
    s.image,
    s.name,
    s.status,
    s.website,
    s.currently_registered,
    s.peer_id,
    s.public_key,
    s.satellite_action_counter,
    s.governance_proposal_counter,
    s.financial_request_counter,
    s.total_delegated_amount,
    s.registration_timestamp,
    
    -- User information
    mu.address as user_address,
    mu.smvn_balance,
    mu.mvn_balance,
    
    -- Delegation information
    COALESCE(sdc.delegator_count, 0) as delegator_count,
    
    -- Free space calculation
    GREATEST(
        CASE 
            WHEN d.delegation_ratio = 0 THEN mu.smvn_balance * 10000
            ELSE mu.smvn_balance * 10000 / d.delegation_ratio
        END - (mu.smvn_balance + s.total_delegated_amount),
        0
    ) as free_smvn_balance,
    
    -- Participation rate calculation based on governance contract counters (scaled to 0-10000)
    CASE 
        WHEN (gc.total_proposals_created + gc.total_financial_requests_created + gc.total_satellite_actions_created) > 0 
        THEN ROUND(
            (
                (COALESCE(sgp.proposals_voted_on, 0) + COALESCE(sfp.financial_requests_voted_on, 0) + COALESCE(sap.satellite_actions_voted_on, 0))::float / 
                (gc.total_proposals_created + gc.total_financial_requests_created + gc.total_satellite_actions_created)::float
            ) * 10000
        )
        ELSE 0 
    END as participation_rate,
    
    -- Governance participation breakdown
    COALESCE(sgp.proposals_voted_on, 0) as proposals_voted_on,
    COALESCE(sfp.financial_requests_voted_on, 0) as financial_requests_voted_on,
    COALESCE(sap.satellite_actions_voted_on, 0) as satellite_actions_voted_on,
    
    -- Rewards information
    COALESCE(sr.smvn_rewards_total, 0) as smvn_rewards_total,
    COALESCE(sr.mvrk_rewards_total, 0) as mvrk_rewards_total,
    
    -- Feeds observations
    COALESCE(sfo.total_observations_count, 0) as total_observations_count,
    
    -- Oracle efficiency (participated_feeds)
    CASE 
        WHEN soe.total_feeds_observation > 0 THEN
            ROUND(LEAST(10000, GREATEST(0, (soe.prediction_success_ratio / soe.total_feeds_observation::float) * 10000)))
        ELSE 0
    END as participated_feeds,
    
    -- Governance counts
    COALESCE(sgc.created_gov_proposals_count, 0) as created_gov_proposals_count,
    COALESCE(sgc.created_fin_requests_count, 0) as created_fin_requests_count,
    COALESCE(sgc.created_satellite_gov_actions_count, 0) as created_satellite_gov_actions_count,
    COALESCE(sgc.gov_proposals_votes_count, 0) as gov_proposals_votes_count,
    COALESCE(sgc.fin_requests_votes_count, 0) as fin_requests_votes_count,
    COALESCE(sgc.satellite_gov_actions_votes_count, 0) as satellite_gov_actions_votes_count,
    
    -- Latest voting power
    COALESCE(lvp.total_voting_power, 0) as total_voting_power,
    
    -- Last voted proposal
    lvp2.vote as last_vote,
    lvp2.proposal_id as last_proposal_id,
    lvp2.proposal_title as last_proposal_title,
    lvp2.proposal_cycle as last_proposal_cycle,
    lvp2.current_round_proposal as last_proposal_current_round,
    lvp2.governance_cycle_id as last_proposal_governance_cycle_id,
    
    -- Last observation details
    COALESCE(slo.last_observation_aggregator_address, '') as last_observation_aggregator_address,
    slo.last_observation_timestamp as last_observation_timestamp,
    COALESCE(slo.last_observation_data, 0) as last_observation_data,
    COALESCE(slo.last_observation_epoch, 0) as last_observation_epoch,
    COALESCE(slo.last_observation_round, 0) as last_observation_round,
    
    -- Timestamp
    NOW() as last_updated
FROM 
    satellite s
    JOIN maven_user mu ON s.user_id = mu.id
    JOIN delegation d ON s.delegation_id = d.id
    LEFT JOIN satellite_delegator_counts sdc ON s.id = sdc.satellite_id
    LEFT JOIN satellite_governance_participation sgp ON s.id = sgp.satellite_id
    LEFT JOIN satellite_financial_participation sfp ON s.id = sfp.satellite_id
    LEFT JOIN satellite_action_participation sap ON s.id = sap.satellite_id
    LEFT JOIN governance_counters gc ON true
    LEFT JOIN satellite_rewards sr ON s.user_id = sr.user_id
    LEFT JOIN satellite_feeds_observations sfo ON s.user_id = sfo.user_id
    LEFT JOIN satellite_oracle_efficiency soe ON s.user_id = soe.user_id
    LEFT JOIN satellite_governance_counts sgc ON s.user_id = sgc.user_id
    LEFT JOIN latest_voting_power lvp ON s.user_id = lvp.user_id
    LEFT JOIN last_voted_proposal lvp2 ON s.user_id = lvp2.voter_id
    LEFT JOIN satellite_last_observation slo ON s.user_id = slo.user_id
ORDER BY 
    s.total_delegated_amount DESC; 
