use tokio_postgres::{Client, Error, NoTls};

use crate::config::get_config;

/// insert a vote in the database
pub async fn insert_vote(client: &Client, id: &str, value: &str) -> Result<(), Error> {
    let statement = client
        .prepare("INSERT INTO votes(id,vote) VALUES($1, $2) ON CONFLICT ON CONSTRAINT votes_id_key DO UPDATE SET vote = $2 WHERE votes.id=$1")
        .await?;

    client.execute(&statement, &[
        &id,
        &value,
    ]).await?;

    Ok(())
}



/// retrieve a connection
/// initialize the database and return a connection
pub async fn init_db() -> Result<Client, Error> {
    // Connect to the database.
    let c = get_config();
    let uri = format!("host={} user={} password={}", c.db_host, c.db_user, c.db_pwd);
    let (
        client,
        connection
    ) = tokio_postgres::connect(&uri, NoTls).await?;

    // The connection object performs the actual communication with the database,
    // so spawn it off to run on its own.
    tokio::spawn(async move {
        if let Err(e) = connection.await {
            eprintln!("connection error: {}", e);
        }
    });

    // create table only if needed
    let init_query = "CREATE TABLE IF NOT EXISTS votes (id VARCHAR(255) NOT NULL UNIQUE, vote VARCHAR(255) NOT NULL)";
    client
        .execute(init_query, &[])
        .await?;

    Ok(client)
}
