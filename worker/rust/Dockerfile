FROM rust:1-buster AS build

ARG TARGETARCH=x86_64-unknown-linux-musl

WORKDIR /usr/src/worker-rust

RUN rustup target add x86_64-unknown-linux-musl

RUN USER=root cargo init

COPY ./Cargo.toml ./Cargo.lock ./

RUN cargo build --release

COPY ./src ./src

RUN cargo install --target $TARGETARCH --path .

FROM scratch

COPY --from=build /usr/local/cargo/bin/worker-rust .

USER 1000

CMD ["./worker-rust"]
