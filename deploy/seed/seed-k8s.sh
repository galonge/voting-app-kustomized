# Random numbers of vote
NUMBER_OF_VOTES=$(( $RANDOM % 100 + 1 ))

# Vote for first or second item
chars=ab
for i in $(seq 1 $NUMBER_OF_VOTES); do
   char="${chars:RANDOM%${#chars}:1}"
   curl -sX POST \
   -H "Content-type: application/json" \
   -d '{"vote": "'$char'"}' \
   http://vote.vote 1>/dev/null
done
