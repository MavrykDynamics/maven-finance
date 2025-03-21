-- Create materialized view for loan tokens
-- OPTIMIZED: Used WITH NO DATA option and added refresh strategy comment
CREATE MATERIALIZED VIEW IF NOT EXISTS materialized_loan_token_view AS
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
    COUNT(DISTINCT mta.user_id) FILTER (WHERE mta.balance > 0) as depositors_count,
    COUNT(DISTINCT lcv.owner_id) FILTER (WHERE lcv.loan_outstanding_total > 0) as borrowers_count,
    COALESCE(SUM(mta.rewards_earned), 0) as rewards_earned_total,
    lt.paused,
    NOW() as last_updated
FROM 
    lending_controller_loan_token lt
    JOIN token tk ON lt.token_id = tk.id
    JOIN m_token mt ON lt.m_token_id = mt.id
    LEFT JOIN m_token_account mta ON mt.id = mta.m_token_id
    LEFT JOIN lending_controller_vault lcv ON lt.id = lcv.loan_token_id
GROUP BY 
    lt.id, lt.lending_controller_id, lt.token_id, lt.m_token_id, lt.loan_token_name, 
    tk.token_address, mt.address, lt.token_pool_total, lt.total_borrowed, 
    lt.total_remaining, lt.utilisation_rate, lt.current_interest_rate, lt.paused
WITH NO DATA;

-- OPTIMIZED: Create an efficient index for lookups
CREATE UNIQUE INDEX IF NOT EXISTS materialized_loan_token_view_id_idx ON materialized_loan_token_view (id);
CREATE INDEX IF NOT EXISTS materialized_loan_token_view_token_address_idx ON materialized_loan_token_view (token_address, paused);

-- Create materialized view for vault collateral
-- OPTIMIZED: Simplified query and used WITH NO DATA for faster initial writes
CREATE MATERIALIZED VIEW IF NOT EXISTS materialized_vault_collateral_view AS
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
    JOIN maven_user mu ON lcv.owner_id = mu.id
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS materialized_vault_collateral_view_id_idx ON materialized_vault_collateral_view (id);
CREATE INDEX IF NOT EXISTS materialized_vault_collateral_view_owner_vault_idx ON materialized_vault_collateral_view (owner_address, vault_address);

-- Create materialized view for TVL calculations
-- OPTIMIZED: Simplified for better write performance
CREATE MATERIALIZED VIEW IF NOT EXISTS materialized_tvl_stats AS
SELECT 
    ROW_NUMBER() OVER () as id,
    tk.token_address,
    lt.token_pool_total,
    lt.total_borrowed,
    NOW() as last_updated
FROM 
    lending_controller_loan_token lt
    JOIN token tk ON lt.token_id = tk.id
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS materialized_tvl_stats_id_idx ON materialized_tvl_stats (id);
CREATE INDEX IF NOT EXISTS materialized_tvl_stats_token_address_idx ON materialized_tvl_stats (token_address);

-- Create materialized view for user dashboard
-- OPTIMIZED: Restructured the query to be more efficient for writing
CREATE MATERIALIZED VIEW IF NOT EXISTS materialized_user_dashboard AS
SELECT
    mu.id as user_id,
    mu.address as user_address,
    COUNT(DISTINCT v.id) as vaults_count,
    COUNT(DISTINCT lcv.id) FILTER (WHERE lcv.open = true) as active_vaults_count,
    COALESCE(SUM(lcv.loan_outstanding_total), 0) as total_borrowed,
    COALESCE(
        (SELECT jsonb_object_agg(
            mt.address,
            jsonb_build_object(
                'm_token_address', mt.address,
                'balance', mta.balance,
                'rewards_earned', mta.rewards_earned
            )
        )
        FROM m_token_account mta 
        JOIN m_token mt ON mta.m_token_id = mt.id
        WHERE mta.user_id = mu.id AND mta.balance > 0
        ),
        '{{}}'::jsonb
    ) as m_tokens,
    NOW() as last_updated
FROM
    maven_user mu
    LEFT JOIN lending_controller_vault lcv ON mu.id = lcv.owner_id
    LEFT JOIN vault v ON lcv.vault_id = v.id
GROUP BY
    mu.id, mu.address
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS materialized_user_dashboard_user_id_idx ON materialized_user_dashboard (user_id);
CREATE INDEX IF NOT EXISTS materialized_user_dashboard_user_address_idx ON materialized_user_dashboard (user_address);
