import json
import pymongo
from pymongo import MongoClient
import tkinter as tk
from tkinter import filedialog

# เชื่อมต่อกับ MongoDB
client = MongoClient("mongodb://root:12345678@localhost:27017/")
db = client["ALiN"]

def import_json_to_mongodb(collection_name, file_path):
    client = MongoClient('mongodb://root:12345678@localhost:27017/')
    db = client['ALiN']
    collection = db[collection_name]
    
    with open(file_path, 'r') as file:
        content = file.read()
        try:
            # Attempt to load it as a standard JSON array
            data = json.loads(content)
            if isinstance(data, dict):  # Handle a single JSON object
                collection.insert_one(data)
            else:  # Handle an array of JSON objects
                collection.insert_many(data)
        except json.JSONDecodeError:
            # Handle files with multiple JSON objects not in an array
            try:
                # Correcting potentially broken array formations
                data = json.loads(f'[{content.replace("}{", "},{")}]')
                collection.insert_many(data)
            except json.JSONDecodeError as e:
                print(f"An error occurred: {e}")


# ฟังก์ชันเลือกไฟล์
def select_file():
    root = tk.Tk()
    root.withdraw()  # ปิดหน้าต่างหลักของ tkinter
    file_path = filedialog.askopenfilename(filetypes=[("JSON files", "*.json")])
    if file_path:
        collection_name = file_path.split('/')[-1].split('.')[0]
        import_json_to_mongodb(collection_name, file_path)

# เรียกฟังก์ชันเลือกไฟล์
select_file()
