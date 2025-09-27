import json
import sys

# Read the input JSON file
with open('src/assets/content_mapping/fixed_content_mapping.json', 'r') as f:
    try:
        data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        sys.exit(1)

# Remove slides 50-52
for i in range(50, 53):
    slide_key = f"slide_{i:02d}"
    if slide_key in data:
        del data[slide_key]

# Write the output JSON file
with open('src/assets/content_mapping/updated_content_mapping.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"Successfully created JSON with {len(data)} slides")