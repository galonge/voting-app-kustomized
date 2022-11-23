extern crate redis;

use crate::db::init_db;
use crate::redis_conn::init_redis;
use crate::votes::handle_votes;

mod db;
mod redis_conn;
mod votes;
mod app_error;
mod config;

#[tokio::main]
async fn main() {
    let t = async {
        let db_conn = init_db();
        let redis_conn = init_redis();

        (db_conn.await, redis_conn.await)
    };

    // wait until the db and redis are ready
    match t.await {
        (Ok(db_conn), Ok(redis_conn)) => {
            let mut mr_conn = redis_conn;
            loop {
                // each time a vote has been handled, try to handle an other
                match handle_votes(&db_conn, &mut mr_conn).await {
                    Ok(()) => println!("new vote inserted in db"),
                    Err(e) => println!("FATAL handle vote: {}", e),
                }
            }
        }
        (_, Err(e)) => println!("FATAL redis: {}", e),
        (Err(e), _) => println!("FATAL db: {}", e),
    }
}

