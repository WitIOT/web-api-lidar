import json
import mariadb
import sys

# ฟังก์ชันสำหรับการเชื่อมต่อ MariaDB
def connect_to_database():
    try:
        conn = mariadb.connect(
            user="root",  # ชื่อผู้ใช้ของฐานข้อมูล
            password="12345678",  # รหัสผ่านของฐานข้อมูล
            host="192.168.2.190",  # ที่อยู่ของเซิร์ฟเวอร์ฐานข้อมูล
            port=3306,  # พอร์ตที่ใช้งานของฐานข้อมูล
            database="ALiN"  # ชื่อของฐานข้อมูลที่ต้องการใช้งาน

            # user="root",  # ชื่อผู้ใช้ของฐานข้อมูล
            # password="12345678",  # รหัสผ่านของฐานข้อมูล
            # host="localhost",  # ที่อยู่ของเซิร์ฟเวอร์ฐานข้อมูล
            # port=3306,  # พอร์ตที่ใช้งานของฐานข้อมูล
            # database="ALiN"  # ชื่อของฐานข้อมูลที่ต้องการใช้งาน
        )
        return conn
    except mariadb.Error as e:
        print(f"Error connecting to MariaDB Platform: {e}")
        sys.exit(1)

# ฟังก์ชันสำหรับการเลือกไฟล์ JSON และการอ่านข้อมูล
def read_json_file(file_path):
    try:
        with open(file_path, 'rb') as file:
            data = json.load(file)
            return data
    except FileNotFoundError:
        print(f"File not found: {file_path}")
        return None
    except json.JSONDecodeError:
        print(f"Error decoding JSON file: {file_path}")
        return None

def insert_into_database(connection, data):
    try:
        cursor = connection.cursor()
        for item in data:
            # query2 = "INSERT INTO ALiN_01 (dis, OC_cal, MPL_dis, MPL_cal) VALUES (%s, %s, NULL, %s)"
            query2 = "INSERT INTO ALiN_03 (OC_dis, OC_cal, MPL_dis, MPL_cal) VALUES (%s, %s, %s, %s)"  # Adjusted query
            cursor.execute(query2, (item['dis'], item['OC_cal'], item['MPL_dis'], item['MPL_cal']))
        connection.commit()
        cursor.close()
        print("Data inserted successfully.")
    except mariadb.Error as e:
        print(f"Error inserting data into MariaDB: {e}")

        
# เรียกใช้งานฟังก์ชันเพื่อดำเนินการ
def main():
    # เลือกไฟล์ JSON
    file_path = r"C:\Users\gunda\OneDrive - NARIT\lidar data\lidar software\new\t1\json file\ALiN_202404170545.json"
    # อ่านข้อมูลจากไฟล์ JSON
    data = read_json_file(file_path)
    if data is not None:
        # เชื่อมต่อกับฐานข้อมูล MariaDB
        connection = connect_to_database()
        if connection is not None:
            # สร้างรายการข้อมูลจาก JSON ที่เหมาะสม
            processed_data = []
            for item in data:
                for i in range(len(item['MPL_cal'])):
                    sub_item = {
                        'dis': item['dis'][i],
                        'OC_cal': item['OC_cal'][i],
                        'MPL_dis': item['MPL_dis'][i],
                        'MPL_cal': item['MPL_cal'][i]
                    }
                    processed_data.append(sub_item)
            # เพิ่มข้อมูลลงในฐานข้อมูล
            insert_into_database(connection, processed_data)
            connection.close()

if __name__ == "__main__":
    main()


