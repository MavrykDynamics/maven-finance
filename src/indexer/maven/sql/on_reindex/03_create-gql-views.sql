DROP VIEW IF EXISTS gql_loan_token_market_stats CASCADE;
CREATE OR REPLACE VIEW gql_loan_token_market_stats AS
SELECT 
    id,
    token_address,
    m_token_address,
    loan_token_name,
    token_pool_total,
    total_borrowed,
    total_remaining,
    utilisation_rate,
    current_interest_rate,
    depositors_count,
    borrowers_count,
    rewards_earned_total,
    lending_controller_id,
    token_id,
    m_token_id,
    last_updated,
    paused,
    (SELECT lt.reserve_ratio FROM lending_controller_loan_token lt WHERE lt.id = loan_token_view.id) as reserve_ratio
FROM 
    loan_token_view;

DROP VIEW IF EXISTS gql_vault_with_balances CASCADE;
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
        lcv.open as is_open,
        v.allowance,
        lct.current_interest_rate,
        lct.borrow_index,
        lct.total_remaining,
        lct.token_pool_total,
        lct.reserve_ratio,
        lct.min_repayment_amount
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
    COALESCE(cd.collateral_json, '{}'::jsonb) as collateral_json,
    COALESCE(dd.depositors_json, '{}'::jsonb) as depositors_json,
    vd.is_open,
    vd.allowance,
    vd.current_interest_rate,
    vd.borrow_index,
    vd.total_remaining,
    vd.token_pool_total,
    vd.reserve_ratio,
    vd.min_repayment_amount,
    NOW() as last_updated
FROM 
    vault_data vd
    LEFT JOIN collateral_data cd ON vd.lending_controller_vault_id = cd.lending_controller_vault_id
    LEFT JOIN depositor_data dd ON vd.vault_id = dd.vault_id;

DROP VIEW IF EXISTS gql_history_data_summary CASCADE;
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
