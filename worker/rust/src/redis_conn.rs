use redis::RedisResult;

use crate::config::get_config;

// retrieve a redis connection
pub async fn init_redis() -> RedisResult<crate::redis::aio::Connection> {
    let c = get_config();
    let uri = format!("redis://{}/", c.redis_host);
    let client = redis::Client::open(uri).unwrap();
    client.get_async_connection().await
}

