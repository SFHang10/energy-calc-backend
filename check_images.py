import json

# Load the ETL static data
with open('etl-products-static.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("🔍 Checking for product images in ETL data...")
print(f"Total products: {data['totalProducts']}")

# Check first product for image fields
first_product = data['products'][0]
print(f"\n📋 First product sample:")
for key, value in first_product.items():
    if 'image' in key.lower() or 'url' in key.lower():
        print(f"  {key}: {value}")

# Count products with images
products_with_images = 0
products_without_images = 0
sample_images = []

for product in data['products']:
    image_url = product.get('imageUrl')
    if image_url and image_url.strip():
        products_with_images += 1
        if len(sample_images) < 5:
            sample_images.append(image_url)
    else:
        products_without_images += 1

print(f"\n📊 Image Statistics:")
print(f"  Products WITH images: {products_with_images}")
print(f"  Products WITHOUT images: {products_without_images}")
print(f"  Percentage with images: {(products_with_images/data['totalProducts'])*100:.1f}%")

if sample_images:
    print(f"\n🖼️ Sample image URLs:")
    for i, img in enumerate(sample_images, 1):
        print(f"  {i}. {img}")
else:
    print(f"\n❌ No image URLs found in the data")









