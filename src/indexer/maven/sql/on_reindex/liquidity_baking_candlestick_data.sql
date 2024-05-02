-- More info about candlestick data generation with TimescaleDB
-- https://docs.timescale.com/timescaledb/latest/tutorials/financial-tick-data/
-- Prepare the table to be a hypertable

ALTER TABLE
    liquidity_baking_history_data DROP CONSTRAINT liquidity_baking_history_data_pkey;

ALTER TABLE
    liquidity_baking_history_data
ADD PRIMARY KEY (id, timestamp);

-- Create a hypertable

SELECT
    create_hypertable(
        'liquidity_baking_history_data',
        'timestamp'
    );

-- Create a view to aggregate data every minutes for 5 minutes

CREATE MATERIALIZED VIEW LIQUIDITY_BAKING_5M_CANDLE 
WITH(TIMESCALEDB.CONTINUOUS) AS 
	SELECT
	    time_bucket('5 minutes', timestamp) AS bucket,
	    FIRST(token_price, timestamp) AS "open",
	    MAX(token_price) AS high,
	    MIN(token_price) AS low,
	    LAST(token_price, timestamp) AS "close",
        SUM(mvrk_qty) AS mvrk_volume,
        SUM(token_qty) AS token_volume,
        COUNT(id) AS trades
	FROM
	    liquidity_baking_history_data
	GROUP BY
BUCKET;

-- Create a refresh policy for the view

SELECT
    add_continuous_aggregate_policy(
        'LIQUIDITY_BAKING_5M_CANDLE',
        start_offset => INTERVAL '15 minutes',
        end_offset => INTERVAL '5 minutes',
        schedule_interval => INTERVAL '5 minutes'
    );

-- Create a view to aggregate data every minutes for 15 minutes

CREATE MATERIALIZED VIEW LIQUIDITY_BAKING_15M_CANDLE 
WITH(TIMESCALEDB.CONTINUOUS) AS 
	SELECT
	    time_bucket('15 minutes', timestamp) AS bucket,
	    FIRST(token_price, timestamp) AS "open",
	    MAX(token_price) AS high,
	    MIN(token_price) AS low,
	    LAST(token_price, timestamp) AS "close",
        SUM(mvrk_qty) AS mvrk_volume,
        SUM(token_qty) AS token_volume,
        COUNT(id) AS trades
	FROM
	    liquidity_baking_history_data
	GROUP BY
BUCKET;

-- Create a refresh policy for the view

SELECT
    add_continuous_aggregate_policy(
        'LIQUIDITY_BAKING_15M_CANDLE',
        start_offset => INTERVAL '45 minutes',
        end_offset => INTERVAL '15 minutes',
        schedule_interval => INTERVAL '15 minutes'
    );

-- Create a view to aggregate data every minutes for 60 minutes

CREATE MATERIALIZED VIEW LIQUIDITY_BAKING_1H_CANDLE 
WITH(TIMESCALEDB.CONTINUOUS) AS 
	SELECT
	    time_bucket('1 hour', timestamp) AS bucket,
	    FIRST(token_price, timestamp) AS "open",
	    MAX(token_price) AS high,
	    MIN(token_price) AS low,
	    LAST(token_price, timestamp) AS "close",
        SUM(mvrk_qty) AS mvrk_volume,
        SUM(token_qty) AS token_volume,
        COUNT(id) AS trades
	FROM
	    liquidity_baking_history_data
	GROUP BY
BUCKET;

-- Create a refresh policy for the view

SELECT
    add_continuous_aggregate_policy(
        'LIQUIDITY_BAKING_1H_CANDLE',
        start_offset => INTERVAL '180 minutes',
        end_offset => INTERVAL '1 hour',
        schedule_interval => INTERVAL '1 hour'
    );

-- Create a view to aggregate data every minutes for one day

CREATE MATERIALIZED VIEW LIQUIDITY_BAKING_1D_CANDLE 
WITH(TIMESCALEDB.CONTINUOUS) AS 
	SELECT
	    time_bucket('1 day', timestamp) AS bucket,
	    FIRST(token_price, timestamp) AS "open",
	    MAX(token_price) AS high,
	    MIN(token_price) AS low,
	    LAST(token_price, timestamp) AS "close",
        SUM(mvrk_qty) AS mvrk_volume,
        SUM(token_qty) AS token_volume,
        COUNT(id) AS trades
	FROM
	    liquidity_baking_history_data
	GROUP BY
BUCKET;

-- Create a refresh policy for the view

SELECT
    add_continuous_aggregate_policy(
        'LIQUIDITY_BAKING_1D_CANDLE',
        start_offset => INTERVAL '3 days',
        end_offset => INTERVAL '1 day',
        schedule_interval => INTERVAL '1 day'
    );

-- Create a view to aggregate data every minutes for one week

CREATE MATERIALIZED VIEW LIQUIDITY_BAKING_1W_CANDLE 
WITH(TIMESCALEDB.CONTINUOUS) AS 
	SELECT
	    time_bucket('1 week', timestamp) AS bucket,
	    FIRST(token_price, timestamp) AS "open",
	    MAX(token_price) AS high,
	    MIN(token_price) AS low,
	    LAST(token_price, timestamp) AS "close",
        SUM(mvrk_qty) AS mvrk_volume,
        SUM(token_qty) AS token_volume,
        COUNT(id) AS trades
	FROM
	    liquidity_baking_history_data
	GROUP BY
BUCKET;

-- Create a refresh policy for the view

SELECT
    add_continuous_aggregate_policy(
        'LIQUIDITY_BAKING_1W_CANDLE',
        start_offset => INTERVAL '3 weeks',
        end_offset => INTERVAL '1 week',
        schedule_interval => INTERVAL '1 week'
    );