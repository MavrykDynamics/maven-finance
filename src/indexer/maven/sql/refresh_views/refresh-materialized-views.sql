DO $$
BEGIN
    RAISE NOTICE 'Refreshing materialized_tvl_stats';
    PERFORM pg_advisory_lock(hashtext('refresh_materialized_tvl_stats'));
    REFRESH MATERIALIZED VIEW CONCURRENTLY materialized_tvl_stats;
    PERFORM pg_advisory_unlock(hashtext('refresh_materialized_tvl_stats'));
    
    PERFORM pg_sleep(2);
    
    RAISE NOTICE 'Refreshing materialized_loan_token_view';
    PERFORM pg_advisory_lock(hashtext('refresh_materialized_loan_token_view'));
    REFRESH MATERIALIZED VIEW CONCURRENTLY materialized_loan_token_view;
    PERFORM pg_advisory_unlock(hashtext('refresh_materialized_loan_token_view'));
    
    PERFORM pg_sleep(2);
    
    RAISE NOTICE 'Refreshing materialized_vault_collateral_view';
    PERFORM pg_advisory_lock(hashtext('refresh_materialized_vault_collateral_view'));
    REFRESH MATERIALIZED VIEW CONCURRENTLY materialized_vault_collateral_view;
    PERFORM pg_advisory_unlock(hashtext('refresh_materialized_vault_collateral_view'));
    
    PERFORM pg_sleep(2);
    
    RAISE NOTICE 'Refreshing materialized_user_dashboard';
    PERFORM pg_advisory_lock(hashtext('refresh_materialized_user_dashboard'));
    REFRESH MATERIALIZED VIEW CONCURRENTLY materialized_user_dashboard;
    PERFORM pg_advisory_unlock(hashtext('refresh_materialized_user_dashboard'));
    
    RAISE NOTICE 'All materialized views refreshed successfully';
END
$$;