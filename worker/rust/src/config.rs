use std::env;

pub struct Config {
    pub db_host: String,
    pub db_user: String,
    pub db_pwd: String,
    pub redis_host: String,
}

/// return (user, password)
fn get_db_cred() -> (String, String) {
    let user = match env::var("POSTGRES_USER") {
        Ok(val) => val,
        Err(_) =>  "postgres".to_string(),
    };

    let pwd = match env::var("POSTGRES_PASSWORD") {
        Ok(val) => val,
        Err(_) => "postgres".to_string(),
    };

    (user, pwd)
}

pub fn get_config() -> Config {
    let db_host = match env::var("DB_HOST") {
        Ok(val) =>  val,
        Err(_e) => "db".to_string(),
    };

    let redis_host = match env::var("REDIS_HOST") {
        Ok(val) => val,
        Err(_e) =>  "redis".to_string(),
    };

    let (db_user, db_pwd) = get_db_cred();

    return Config {
        db_host,
        db_user,
        db_pwd,
        redis_host,
    };
}