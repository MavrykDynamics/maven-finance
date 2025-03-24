-- Create regular view for loan tokens (optimized)
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
    COALESCE(ut.m_tokens, '{}'::jsonb) as m_tokens,
    NOW() as last_updated
FROM
    user_vaults uv
    LEFT JOIN user_tokens ut ON uv.user_id = ut.user_id; 