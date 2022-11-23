extern crate serde;

use redis::AsyncCommands;
use serde::{Deserialize, Serialize};
use tokio_postgres::Client;

use crate::app_error::AppError;
use crate::db::insert_vote;
use crate::redis::aio::Connection;

#[derive(Serialize, Deserialize, Debug)]
struct Vote {
    voter_id: String,
    vote: String,
}

pub(crate) async fn handle_votes(db: &Client, red_conn: &mut Connection) -> Result<(), AppError> {
    let result: redis::RedisResult<(String, String)> = red_conn.blpop("votes", 0).await;

    if let Err(e) = result {
        return Err(AppError::new(&e.to_string()));
    }

    let v = result.unwrap();
    let vote: Vote = serde_json::from_str(&v.1).unwrap();
    if let Err(e) = insert_vote(&db, &*vote.voter_id, &*vote.vote).await {
        return Err(AppError::new(&e.to_string()));
    }
    Ok(())
}