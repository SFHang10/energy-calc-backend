import json

# Load the ETL static data
with open('etl-products-static.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Create embedded JavaScript data
print("Creating embedded static data...")

# Start building the JavaScript
js_content = "// Embedded ETL Products Data\n"
js_content += "// Generated from etl-products-static.json\n"
js_content += f"// Total products: {data['totalProducts']}\n"
js_content += f"// Last updated: {data['lastUpdated']}\n\n"

js_content += "const EMBEDDED_ETL_PRODUCTS = [\n"

# Add each product
for i, product in enumerate(data['products']):
    js_content += "    {\n"
    for key, value in product.items():
        if value is None:
            js_content += f"        {key}: null,\n"
        elif isinstance(value, str):
            # Escape quotes in strings
            escaped_value = value.replace('"', '\\"').replace('\n', '\\n')
            js_content += f"        {key}: \"{escaped_value}\",\n"
        else:
            js_content += f"        {key}: {json.dumps(value)},\n"
    
    # Remove trailing comma from last property
    js_content = js_content.rstrip(',\n') + "\n"
    js_content += "    }"
    
    # Add comma except for last item
    if i < len(data['products']) - 1:
        js_content += ","
    js_content += "\n"

js_content += "];\n\n"

# Add helper functions
js_content += """
// Helper function to get products by type
function getEmbeddedProductsByType(type) {
    return EMBEDDED_ETL_PRODUCTS.filter(product => product.type === type);
}

// Helper function to get all products
function getAllEmbeddedProducts() {
    return EMBEDDED_ETL_PRODUCTS;
}

// Helper function to search products
function searchEmbeddedProducts(query) {
    const lowerQuery = query.toLowerCase();
    return EMBEDDED_ETL_PRODUCTS.filter(product => 
        product.name.toLowerCase().includes(lowerQuery) ||
        product.brand.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery)
    );
}
"""

# Write to file
with open('embedded-etl-products.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"✅ Created embedded-etl-products.js with {data['totalProducts']} products")
print(f"📁 File size: {len(js_content) / 1024 / 1024:.1f} MB")

# Show sample of what was created
print(f"\n📋 Sample product:")
sample_product = data['products'][0]
for key, value in list(sample_product.items())[:5]:  # Show first 5 fields
    print(f"  {key}: {value}")
print("  ...")









