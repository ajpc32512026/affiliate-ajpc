import json

# Path to your active products.json database
json_path = r"D:\mysites\affiliate-ajpc\json\products.json"

# The number of new products you imported in this batch
num_new_products = 55

# 1. Load the database safely using UTF-8
with open(json_path, 'r', encoding='utf-8') as f:
    products = json.load(f)

total_products = len(products)
print(f"Total products in database: {total_products}")

updated_count = 0
cleared_count = 0

# 2. Flag the last 55 products in the array as True, and clear the older ones
for i, p in enumerate(products):
    if i >= (total_products - num_new_products):
        p["isNew"] = True
        updated_count += 1
    else:
        p.pop("isNew", None) # Remove the tag for older products
        cleared_count += 1

# 3. Save database back
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

print("--- SUCCESS ---")
print(f"• Flagged the last {updated_count} products at the bottom of the file as 'isNew': true.")
print(f"• Cleared the 'isNew' flag on the remaining {cleared_count} older products.")