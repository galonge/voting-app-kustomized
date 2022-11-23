use std::error::Error;
use std::fmt;

#[derive(Debug)]
pub(crate) struct AppError {
    details: String
}

impl AppError {
    pub(crate) fn new(msg: &str) -> AppError {
        AppError {details: msg.to_string()}
    }
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f,"{}",self.details)
    }
}

impl Error for AppError {
    fn description(&self) -> &str {
        &self.details
    }
}