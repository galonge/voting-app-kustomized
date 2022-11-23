FROM golang:1.16-alpine as build
WORKDIR /go/src/github.com/votingapp/worker
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o worker .

FROM scratch
COPY --from=build /go/src/github.com/votingapp/worker/ .
CMD ["./worker"]