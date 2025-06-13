-- logger.debug('Inserting initial user, server, and character data...');
INSERT INTO users (username, silver_coins, silver_coins_last_recharge_at, demon_tribute, demon_tribute_last_recharge_at) VALUES ('test_user', DEFAULT, DEFAULT, DEFAULT, DEFAULT);

INSERT INTO servers (name) VALUES ('던컨'), ('데이안'), ('아이라'), ('알리사'), ('메이븐'), ('라사'), ('칼릭스');

INSERT INTO characters (server_id, user_id, character_name, db_name)
SELECT
    s.server_id, u.id, 'TestCharacter', 'mabinogi_item_db'
FROM
    servers s
JOIN
    users u ON u.username = 'test_user'
WHERE
    s.name = '던컨';
-- logger.debug('User, server, and character data insertion complete.'); 