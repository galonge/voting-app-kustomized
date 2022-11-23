from flask import Flask, request, g, jsonify
from flask_cors import CORS
from redis import Redis
import os
import socket
import random
import json
import logging

# Get name of the current container
hostname = socket.gethostname()

# Define application and enable cors
app = Flask(__name__)
CORS(app)

gunicorn_error_logger = logging.getLogger('gunicorn.error')
app.logger.handlers.extend(gunicorn_error_logger.handlers)
app.logger.setLevel(logging.INFO)


def get_redis():
    if not hasattr(g, 'redis'):
        g.redis = Redis(host="redis", db=0, socket_timeout=5)
    return g.redis


@app.route("/", methods=['POST'])
def vote():
    # Connect to redis database
    redis = get_redis()

    # Get json payload
    payload = request.get_json()

    # Make sure vote and voter_id are provider
    if not 'vote' in payload:
        return jsonify({"error": "missing vote parameter"}), 400

    # Use voter_id if provided, otherwise create a new one and send it to the current client
    if (not 'voter_id' in payload) or payload['voter_id'] == '':
        voter_id = hex(random.getrandbits(64))[2:-1]
    else:
        voter_id = payload['voter_id']

    app.logger.info('Received vote for %s', vote)
    data = json.dumps({'voter_id': voter_id, 'vote': payload['vote']})
    redis.rpush('votes', data)
    return jsonify({"hostname": hostname, "voter_id": voter_id}), 200


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
