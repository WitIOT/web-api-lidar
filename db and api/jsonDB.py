import pymongo
import json
import os
from tkinter import Tk, filedialog, Button

# ฟังก์ชันสำหรับการอ่านไฟล์ JSON
def read_json_file(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data

# ฟังก์ชันสำหรับการเลือกไฟล์ JSON และนำข้อมูลเข้า MongoDB
def select_and_import_json():
    # เปิดหน้าต่างเลือกไฟล์
    root = Tk()
    root.withdraw()  # ซ่อนหน้าต่างหลัก
    json_file_path = filedialog.askopenfilename(filetypes=[("JSON files", "*.json")])  # เลือกไฟล์ JSON
    root.destroy()  # ปิดหน้าต่างหลัก

    # ตรวจสอบว่าไฟล์ถูกเลือกหรือไม่
    if json_file_path:
        # ตั้งค่าเชื่อมต่อ MongoDB
        mongo_uri = 'mongodb://root:12345678@192.168.2.190:27017/'
        client = pymongo.MongoClient(mongo_uri)
        db = client['ocs-data']  # แทนที่ 'your_database_name' ด้วยชื่อของฐานข้อมูลของคุณ

        # ใช้ชื่อของไฟล์ JSON เป็นชื่อของคอลเลกชัน
        collection_name = os.path.splitext(os.path.basename(json_file_path))[0]

        # อ่านข้อมูลจากไฟล์ JSON
        json_data = read_json_file(json_file_path)

        # เลือกหรือสร้างคอลเลกชันใหม่ในฐานข้อมูล
        collection = db[collection_name]

        # เพิ่มข้อมูลเข้า MongoDB
        collection.insert_one(json_data)

        print("JSON file has been successfully imported into MongoDB.")

# สร้างปุ่มเพื่อเปิดหน้าต่างเลือกไฟล์
button = Button(text="Browse JSON File", command=select_and_import_json)
button.pack()

# เริ่มการทำงานของ UI
Tk().mainloop()
