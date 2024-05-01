from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

# MongoDB configuration
client = MongoClient("mongodb://root:12345678@192.168.2.190:27017/")
# client = MongoClient("mongodb://root:12345678@localhost:27017/")

# Define route to list all databases
@app.route('/databases')
def get_databases():
    # Get list of database names
    databases = client.list_database_names()
    return jsonify(databases)

# Define route to list collections in selected database
@app.route('/collections/<db_name>')
def get_collections(db_name):
    # Check if the provided database exists
    if db_name in client.list_database_names():
        # Connect to the selected database
        db = client[db_name]
        # Get list of collection names in the selected database
        collections = db.list_collection_names()
        return jsonify(collections)
    else:
        return jsonify({"error": "Database not found"}), 404

@app.route('/data/<db_name>/<collection_name>')
def get_collection_data(db_name, collection_name):
    # Check if the provided database exists
    if db_name in client.list_database_names():
        # Connect to the selected database
        db = client[db_name]
        # Check if the provided collection exists in the selected database
        if collection_name in db.list_collection_names():
            # Get collection object
            collection = db[collection_name]
            # Retrieve all documents from the collection
            documents = list(collection.find({}, {"_id": 0}))
            return jsonify(documents)
        else:
            return jsonify({"error": "Collection not found"}), 404
    else:
        return jsonify({"error": "Database not found"}), 404

@app.route('/insert/<db_name>/<collection_name>', methods=['POST'])
def insert_data(db_name, collection_name):
    # Check if the provided database exists
    if db_name in client.list_database_names():
        # Connect to the selected database
        db = client[db_name]
        # Check if the provided collection exists in the selected database
        if collection_name in db.list_collection_names():
            # Get JSON data from the request body
            data = request.json
            # Get collection object
            collection = db[collection_name]
            # Insert data into the collection
            collection.insert_one(data)
            return jsonify({"message": "Data inserted successfully"})
        else:
            return jsonify({"error": "Collection not found"}), 404
    else:
        return jsonify({"error": "Database not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
