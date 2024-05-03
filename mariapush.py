import requests
import pymysql

# API and database settings
api_url = "http://192.168.2.190:5000/data/ALiN_Cheer/ALiN_Cheer202404032015"
db_config = {
    "host": "192.168.2.190",
    "port": 3306,
    "user": "root",
    "password": "12345678",
    "db": "ALiN"
}

# Fetch data from the API
response = requests.get(api_url)
data = response.json()

# Function to insert data into MariaDB
def insert_data(data, db_config):
    connection = pymysql.connect(host=db_config['host'],
                                 user=db_config['user'],
                                 password=db_config['password'],
                                 database=db_config['db'],
                                 cursorclass=pymysql.cursors.DictCursor)
    try:
        with connection.cursor() as cursor:
            for entry in data:
                mpl_cal = entry.get('MPL_cal', [])
                mpl_dis = entry.get('MPL_dis', [])
                oc_cal = entry.get('OC_cal', [])
                oc_dis = entry.get('dis', [])

                # Calculate minimum length to safely access all lists
                min_length = min(len(mpl_cal), len(mpl_dis), len(oc_cal), len(oc_dis))

                # Build an SQL query for insertion
                sql = """
                INSERT INTO ALiN_04 (OC_dis, OC_cal, MPL_dis, MPL_cal)
                VALUES (%s, %s, %s, %s)
                """
                # Execute SQL query multiple times for each index of the data lists
                for i in range(min_length):
                    cursor.execute(sql, (oc_dis[i], oc_cal[i], mpl_dis[i], mpl_cal[i]))

        connection.commit()
    finally:
        connection.close()

# Call the function to insert data
insert_data(data, db_config)
