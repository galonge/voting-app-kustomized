package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"github.com/go-redis/redis/v8"
	_ "github.com/lib/pq"
	"os"
	"time"
)

var (
	ctx = context.Background()
	rdb *redis.Client
	db  *sql.DB
	err error
)

type Vote struct {
	Vote    string `json:"vote"`
	VoterID string `json:"voter_id"`
}

func CheckError(err error) {
	if err != nil {
		panic(err)
	}
}

func connectToDB() {
	// Redis
	ctx = context.Background()
	for {
		time.Sleep(1 * time.Second)

		rdb = redis.NewClient(&redis.Options{
			Addr:         "redis:6379",
			DialTimeout:  10 * time.Second,
			ReadTimeout:  30 * time.Second,
			WriteTimeout: 30 * time.Second,
			PoolSize:     10,
			PoolTimeout:  30 * time.Second,
		})
		if err = rdb.Ping(ctx).Err(); err != nil {
			fmt.Println("Waiting for Redis " + err.Error())
			continue
		}
		fmt.Println("->  Connected to Redis !")
		break
	}

	// Postgres
	
 	host              := "db"
	port              := 5432
	postgres_user     := "postgres"
	postgres_password := "postgres"
	postgres_database := "postgres"
 
  if pg_user := os.Getenv("POSTGRES_USER"); pg_user != "" {
    postgres_user = pg_user
  }

  if pg_password := os.Getenv("POSTGRES_PASSWORD"); pg_password != "" {
    postgres_password = pg_password
  }

	psqlconn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, port, postgres_user, postgres_password, postgres_database)
	for {
		time.Sleep(1 * time.Second)

		db, err = sql.Open("postgres", psqlconn)
		if err != nil {
			CheckError(err)
		}
		err = db.Ping()
		if err != nil {
			fmt.Println("Waiting for Postgres")
			continue
		}
		fmt.Println("->  Connected to Postgres !")
		break
	}

	// Make sure "votes" table exists in Postgres
	createTableStmt := `CREATE TABLE IF NOT EXISTS votes (id VARCHAR(255) NOT NULL UNIQUE, vote VARCHAR(255) NOT NULL)`
	_, err = db.Exec(createTableStmt)
	CheckError(err)
}

func main() {
	// Init databases connection
	connectToDB()

	// Continuously get votes from Redis and add (or update) them into Postgres
	for {
		time.Sleep(400 * time.Millisecond)

		handleVotes(rdb, ctx, db)
	}
}

func handleVotes(rdb *redis.Client, ctx context.Context, db *sql.DB) {
	// Get vote from Redis
	result, err := rdb.BLPop(ctx, 0, "votes").Result()
	if err != nil {
		fmt.Println(err)
		return
	}

	// Convert retrieved string into json
	voteData := result[1]
	var vote Vote
	err = json.Unmarshal([]byte(voteData), &vote)
	if err != nil {
		fmt.Println(err)
		return
	}

	// Insert or update vote in Postgres
	upsertStmt := `INSERT INTO votes(id,vote) VALUES($1, $2) ON CONFLICT ON CONSTRAINT votes_id_key DO UPDATE SET vote = $2 WHERE votes.id=$1`
	_, e := db.Exec(upsertStmt, vote.VoterID, vote.Vote)
	if e != nil {
		fmt.Println(e)
		return
	}
	fmt.Printf("Vote from %s set to %s\n", vote.VoterID, vote.Vote)
}
