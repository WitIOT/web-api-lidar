import json
import tkinter as tk
from tkinter import filedialog

def clean_json_data():
    # Initialize the tkinter GUI window
    root = tk.Tk()
    root.withdraw()  # Use withdraw to hide the main tkinter window

    # Open a file dialog to select the input JSON file
    input_filename = filedialog.askopenfilename(title='Select JSON file', filetypes=[('JSON files', '*.json')])
    if not input_filename:
        print("No file selected.")
        return  # Exit the function if no file is selected

    try:
        # Read the entire content of the file
        with open(input_filename, 'r') as file:
            file_content = file.read()

        # Assuming each JSON object is separated by a newline
        json_objects = file_content.split('\n')

        # Process each JSON string
        processed_data = []
        for json_str in json_objects:
            if json_str.strip():  # Ensure the string is not empty
                obj = json.loads(json_str)
                # Apply filter to MPL_dis: Remove values < 0 or > 5000
                obj['MPL_dis'] = [dis for dis in obj['MPL_dis'] if 0 <= dis <= 5000]
                # Apply filter to OC_cal: Remove values < 0
                obj['OC_cal'] = [cal for cal in obj['OC_cal'] if cal >= 0]
                processed_data.append(obj)

        # Open a file dialog to choose the output file location
        output_filename = filedialog.asksaveasfilename(title='Save file as', filetypes=[('JSON files', '*.json')], defaultextension=".json")
        if not output_filename:
            print("No output file selected.")
            return  # Exit if no file is chosen for saving

        # Save the modified data to the chosen output file
        with open(output_filename, 'w') as file:
            json.dump(processed_data, file, indent=4)

    except json.JSONDecodeError as e:
        print(f"Failed to parse JSON: {e}")

    # Finally, destroy the tkinter root window to clean up
    root.destroy()

# Example usage
clean_json_data()
