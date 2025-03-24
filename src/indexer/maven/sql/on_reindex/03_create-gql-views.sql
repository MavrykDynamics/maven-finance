CREATE OR REPLACE VIEW gql_loan_token_market_stats AS
WITH vault_counts AS (
    SELECT 
        lcv.loan_token_id,
        COUNT(DISTINCT lcv.id) as vaults_count
    FROM 
        lending_controller_vault lcv
    GROUP BY 
        lcv.loan_token_id
)
SELECT 
    ltv.id,
    ltv.token_address,
    ltv.m_token_address,
    ltv.loan_token_name,
    ltv.token_pool_total,
    ltv.total_borrowed,
    ltv.total_remaining,
    ltv.utilisation_rate,
    ltv.current_interest_rate,
    ltv.depositors_count,
    ltv.borrowers_count,
    ltv.rewards_earned_total,
    ltv.lending_controller_id,
    ltv.token_id,
    ltv.m_token_id,
    ltv.last_updated,
    ltv.paused,
    COALESCE(vc.vaults_count, 0) as vaults_count,
    (SELECT lt.reserve_ratio FROM lending_controller_loan_token lt WHERE lt.id = ltv.id) as reserve_ratio
FROM 
    loan_token_view ltv
    LEFT JOIN vault_counts vc ON ltv.id = vc.loan_token_id;

CREATE OR REPLACE VIEW gql_vault_with_balances AS
WITH vault_data AS (
    SELECT 
        v.id as id,
        v.address as vault_address,
        v.id as vault_id,
        v.name as vault_name,
        lcv.id as lending_controller_vault_id,
        lcv.owner_id,
        mu.address as owner_address,
        lcv.loan_token_id,
        tk.token_address as loan_token_address,
        lcv.loan_outstanding_total,
        lcv.loan_principal_total,
        lcv.loan_interest_total,
        lcv.open as is_open
    FROM 
        lending_controller_vault lcv
        JOIN vault v ON lcv.vault_id = v.id
        JOIN maven_user mu ON lcv.owner_id = mu.id
        JOIN lending_controller_loan_token lct ON lcv.loan_token_id = lct.id
        JOIN token tk ON lct.token_id = tk.id
),
collateral_data AS (
    SELECT 
        vcv.lending_controller_vault_id,
        jsonb_object_agg(
            vcv.token_address, 
            jsonb_build_object(
                'balance', vcv.balance,
                'token_name', vcv.collateral_token_name,
                'token_id', vcv.collateral_token_id
            )
        ) as collateral_json
    FROM 
        vault_collateral_view vcv
    GROUP BY 
        vcv.lending_controller_vault_id
),
depositor_data AS (
    SELECT 
        vd.vault_id,
        jsonb_object_agg(
            mu.address, 
            jsonb_build_object(
                'address', mu.address,
                'id', mu.id
            )
        ) as depositors_json
    FROM 
        vault_depositor vd
        JOIN maven_user mu ON vd.depositor_id = mu.id
    GROUP BY 
        vd.vault_id
)
SELECT 
    vd.id,
    vd.vault_address,
    vd.vault_id,
    vd.vault_name,
    vd.lending_controller_vault_id,
    vd.owner_id,
    vd.owner_address,
    vd.loan_token_id,
    vd.loan_token_address,
    vd.loan_outstanding_total,
    vd.loan_principal_total,
    vd.loan_interest_total,
    COALESCE(cd.collateral_json, '{{}}'::jsonb) as collateral_json,
    COALESCE(dd.depositors_json, '{{}}'::jsonb) as depositors_json,
    vd.is_open,
    NOW() as last_updated
FROM 
    vault_data vd
    LEFT JOIN collateral_data cd ON vd.lending_controller_vault_id = cd.lending_controller_vault_id
    LEFT JOIN depositor_data dd ON vd.vault_id = dd.vault_id;

CREATE OR REPLACE VIEW gql_history_data_summary AS
SELECT 
    ROW_NUMBER() OVER () as id,
    date_trunc('day', hd.timestamp) as operation_date,
    tk.token_address,
    tk.id as token_id,
    hd.type as operation_type,
    SUM(hd.amount) as total_amount,
    COUNT(*) as operations_count,
    hd.lending_controller_id
FROM 
    lending_controller_history_data hd
    JOIN lending_controller_loan_token lt ON hd.loan_token_id = lt.id
    JOIN token tk ON lt.token_id = tk.id
GROUP BY 
    date_trunc('day', hd.timestamp), tk.token_address, tk.id, hd.type, hd.lending_controller_id;
