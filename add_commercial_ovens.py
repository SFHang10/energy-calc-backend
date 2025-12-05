#!/usr/bin/env python3
"""
Add commercial restaurant ovens to the existing commercial products
"""

import json
from datetime import datetime

def add_commercial_ovens():
    # Read existing commercial products
    with open('commercial-products.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    existing_products = data['products']
    
    # Commercial Ovens (100 products)
    commercial_ovens = [
        {"id": "RO001", "name": "Convection Oven Single", "power": 5.5, "brand": "Blodgett", "year": "1995", "efficiency": "Very Low"},
        {"id": "RO002", "name": "Deck Oven Double Stack", "power": 12.0, "brand": "Bakers Pride", "year": "1998", "efficiency": "Low"},
        {"id": "RO003", "name": "Combi Oven Steam", "power": 18.5, "brand": "Rational", "year": "2000", "efficiency": "Low"},
        {"id": "RO004", "name": "Conveyor Pizza Oven", "power": 22.0, "brand": "Lincoln", "year": "1992", "efficiency": "Very Low"},
        {"id": "RO005", "name": "Range 6-Burner w/ Oven", "power": 2.8, "brand": "Vulcan", "year": "2003", "efficiency": "Standard"},
        {"id": "RO006", "name": "Convection Oven Double", "power": 10.5, "brand": "Southbend", "year": "2001", "efficiency": "Low"},
        {"id": "RO007", "name": "Rotisserie Oven", "power": 8.5, "brand": "Hickory", "year": "1997", "efficiency": "Low"},
        {"id": "RO008", "name": "Cook & Hold Oven", "power": 6.8, "brand": "Alto-Shaam", "year": "2004", "efficiency": "Low"},
        {"id": "RO009", "name": "Rapid Cook Oven", "power": 14.0, "brand": "TurboChef", "year": "2005", "efficiency": "Standard"},
        {"id": "RO010", "name": "Range 8-Burner Heavy Duty", "power": 3.2, "brand": "Garland", "year": "2002", "efficiency": "Low"},
        {"id": "RO011", "name": "Deck Oven Triple Stack", "power": 18.0, "brand": "Bakers Pride", "year": "1999", "efficiency": "Very Low"},
        {"id": "RO012", "name": "Convection Oven Half Size", "power": 3.8, "brand": "Blodgett", "year": "2006", "efficiency": "Standard"},
        {"id": "RO013", "name": "Combi Oven 20-Pan", "power": 25.0, "brand": "Rational", "year": "1994", "efficiency": "Very Low"},
        {"id": "RO014", "name": "Old Deck Oven", "power": 15.5, "brand": "Generic", "year": "1988", "efficiency": "Very Low"},
        {"id": "RO015", "name": "Convection Oven Standard", "power": 5.2, "brand": "Southbend", "year": "2001", "efficiency": "Low"},
        {"id": "RO016", "name": "Pizza Oven Deck Style", "power": 9.5, "brand": "Bakers Pride", "year": "2003", "efficiency": "Low"},
        {"id": "RO017", "name": "Conveyor Oven Electric", "power": 20.0, "brand": "Lincoln", "year": "1999", "efficiency": "Low"},
        {"id": "RO018", "name": "Compact Convection", "power": 2.9, "brand": "Cadco", "year": "2005", "efficiency": "Standard"},
        {"id": "RO019", "name": "Range 10-Burner w/ Oven", "power": 3.8, "brand": "Vulcan", "year": "2000", "efficiency": "Low"},
        {"id": "RO020", "name": "Cook & Hold Cabinet", "power": 7.2, "brand": "Alto-Shaam", "year": "1996", "efficiency": "Low"},
        {"id": "RO021", "name": "Old Conveyor Oven", "power": 24.0, "brand": "Generic", "year": "1991", "efficiency": "Very Low"},
        {"id": "RO022", "name": "Combi Oven 10-Pan", "power": 16.5, "brand": "Rational", "year": "2004", "efficiency": "Low"},
        {"id": "RO023", "name": "Deck Oven Single", "power": 6.5, "brand": "Bakers Pride", "year": "2002", "efficiency": "Low"},
        {"id": "RO024", "name": "Convection Oven Full Size", "power": 5.8, "brand": "Blodgett", "year": "1998", "efficiency": "Low"},
        {"id": "RO025", "name": "Rapid Cook Turbo", "power": 12.5, "brand": "TurboChef", "year": "2006", "efficiency": "Standard"},
        {"id": "RO026", "name": "Range 6-Burner Heavy Duty", "power": 3.0, "brand": "Garland", "year": "2001", "efficiency": "Low"},
        {"id": "RO027", "name": "Rotisserie Electric", "power": 9.2, "brand": "Hickory", "year": "1997", "efficiency": "Low"},
        {"id": "RO028", "name": "Very Old Deck Oven", "power": 17.0, "brand": "Generic", "year": "1989", "efficiency": "Very Low"},
        {"id": "RO029", "name": "Convection Oven Modern", "power": 5.0, "brand": "Southbend", "year": "2004", "efficiency": "Low"},
        {"id": "RO030", "name": "Combi Oven 6-Pan", "power": 13.5, "brand": "Rational", "year": "2003", "efficiency": "Low"},
        {"id": "RO031", "name": "Pizza Oven Double Deck", "power": 14.0, "brand": "Bakers Pride", "year": "2005", "efficiency": "Standard"},
        {"id": "RO032", "name": "Countertop Convection", "power": 2.2, "brand": "Cadco", "year": "2006", "efficiency": "Standard"},
        {"id": "RO033", "name": "Deck Oven Bakery", "power": 11.0, "brand": "Bakers Pride", "year": "1999", "efficiency": "Low"},
        {"id": "RO034", "name": "Conveyor Oven Wide", "power": 23.5, "brand": "Lincoln", "year": "1995", "efficiency": "Very Low"},
        {"id": "RO035", "name": "Range 4-Burner w/ Oven", "power": 2.4, "brand": "Vulcan", "year": "2000", "efficiency": "Low"},
        {"id": "RO036", "name": "Convection Oven Electric", "power": 5.6, "brand": "Blodgett", "year": "2002", "efficiency": "Low"},
        {"id": "RO037", "name": "Cook & Hold Smoker", "power": 8.8, "brand": "Alto-Shaam", "year": "2001", "efficiency": "Low"},
        {"id": "RO038", "name": "Rapid Cook Counter", "power": 10.5, "brand": "TurboChef", "year": "2005", "efficiency": "Standard"},
        {"id": "RO039", "name": "Old Convection Double", "power": 12.5, "brand": "Generic", "year": "1993", "efficiency": "Very Low"},
        {"id": "RO040", "name": "Deck Oven Pizza Stone", "power": 8.0, "brand": "Bakers Pride", "year": "2003", "efficiency": "Low"},
        {"id": "RO041", "name": "Combi Oven 40-Pan", "power": 32.0, "brand": "Rational", "year": "2000", "efficiency": "Low"},
        {"id": "RO042", "name": "Convection Oven Basic", "power": 4.8, "brand": "Southbend", "year": "1998", "efficiency": "Low"},
        {"id": "RO043", "name": "Countertop Pizza Oven", "power": 3.5, "brand": "Waring", "year": "2006", "efficiency": "Standard"},
        {"id": "RO044", "name": "Heavy Duty Deck Double", "power": 13.5, "brand": "Bakers Pride", "year": "1996", "efficiency": "Very Low"},
        {"id": "RO045", "name": "Range 8-Burner w/ 2 Ovens", "power": 4.2, "brand": "Garland", "year": "2004", "efficiency": "Low"},
        {"id": "RO046", "name": "Conveyor Oven 32\"", "power": 21.5, "brand": "Lincoln", "year": "1997", "efficiency": "Very Low"},
        {"id": "RO047", "name": "Convection Oven Standard", "power": 5.4, "brand": "Blodgett", "year": "2002", "efficiency": "Low"},
        {"id": "RO048", "name": "Small Convection", "power": 2.5, "brand": "Cadco", "year": "2005", "efficiency": "Standard"},
        {"id": "RO049", "name": "Vintage Deck Oven", "power": 19.0, "brand": "Generic", "year": "1990", "efficiency": "Very Low"},
        {"id": "RO050", "name": "Rotisserie Chicken Oven", "power": 7.8, "brand": "Hickory", "year": "2001", "efficiency": "Low"},
        {"id": "RO051", "name": "Combi Oven 7-Pan", "power": 14.8, "brand": "Rational", "year": "2004", "efficiency": "Low"},
        {"id": "RO052", "name": "Deck Oven Triple Pizza", "power": 19.5, "brand": "Bakers Pride", "year": "2000", "efficiency": "Low"},
        {"id": "RO053", "name": "Countertop Rapid Cook", "power": 8.5, "brand": "TurboChef", "year": "2006", "efficiency": "Standard"},
        {"id": "RO054", "name": "Conveyor Oven Double", "power": 28.0, "brand": "Lincoln", "year": "2003", "efficiency": "Low"},
        {"id": "RO055", "name": "Old Convection Single", "power": 6.8, "brand": "Generic", "year": "1997", "efficiency": "Very Low"},
        {"id": "RO056", "name": "Range 12-Burner Restaurant", "power": 4.5, "brand": "Vulcan", "year": "2002", "efficiency": "Low"},
        {"id": "RO057", "name": "Deck Oven Bakery Double", "power": 16.5, "brand": "Bakers Pride", "year": "1992", "efficiency": "Very Low"},
        {"id": "RO058", "name": "Convection Oven Commercial", "power": 5.3, "brand": "Southbend", "year": "2004", "efficiency": "Low"},
        {"id": "RO059", "name": "Cook & Hold Retherm", "power": 6.5, "brand": "Alto-Shaam", "year": "2006", "efficiency": "Standard"},
        {"id": "RO060", "name": "Combi Oven 20-Pan Electric", "power": 24.0, "brand": "Rational", "year": "2002", "efficiency": "Low"},
        {"id": "RO061", "name": "Old Rotisserie", "power": 10.5, "brand": "Generic", "year": "1999", "efficiency": "Low"},
        {"id": "RO062", "name": "Deck Oven Single Pizza", "power": 7.2, "brand": "Bakers Pride", "year": "2003", "efficiency": "Low"},
        {"id": "RO063", "name": "Conveyor Oven Fast Bake", "power": 19.5, "brand": "Lincoln", "year": "2001", "efficiency": "Low"},
        {"id": "RO064", "name": "Countertop Convection Small", "power": 2.0, "brand": "Cadco", "year": "2005", "efficiency": "Standard"},
        {"id": "RO065", "name": "Range 6-Burner Standard", "power": 2.9, "brand": "Garland", "year": "2000", "efficiency": "Low"},
        {"id": "RO066", "name": "Very Old Conveyor", "power": 26.5, "brand": "Generic", "year": "1994", "efficiency": "Very Low"},
        {"id": "RO067", "name": "Combi Oven 10-Pan Electric", "power": 17.2, "brand": "Rational", "year": "2004", "efficiency": "Low"},
        {"id": "RO068", "name": "Small Deck Oven", "power": 4.5, "brand": "Bakers Pride", "year": "2006", "efficiency": "Standard"},
        {"id": "RO069", "name": "Old Double Convection", "power": 11.8, "brand": "Generic", "year": "1998", "efficiency": "Low"},
        {"id": "RO070", "name": "Rapid Cook Speed Oven", "power": 11.5, "brand": "TurboChef", "year": "2002", "efficiency": "Low"},
        {"id": "RO071", "name": "Deck Oven Stone Hearth", "power": 13.0, "brand": "Bakers Pride", "year": "2001", "efficiency": "Low"},
        {"id": "RO072", "name": "Convection Oven Standard", "power": 5.1, "brand": "Blodgett", "year": "2004", "efficiency": "Low"},
        {"id": "RO073", "name": "Vintage Conveyor", "power": 25.0, "brand": "Generic", "year": "1989", "efficiency": "Very Low"},
        {"id": "RO074", "name": "Cook & Hold Low Temp", "power": 7.5, "brand": "Alto-Shaam", "year": "2003", "efficiency": "Low"},
        {"id": "RO075", "name": "Countertop Oven Compact", "power": 2.3, "brand": "Waring", "year": "2006", "efficiency": "Standard"},
        {"id": "RO076", "name": "Combi Oven 6-Pan Steam", "power": 14.0, "brand": "Rational", "year": "2000", "efficiency": "Low"},
        {"id": "RO077", "name": "Range 8-Burner Basic", "power": 3.3, "brand": "Vulcan", "year": "2003", "efficiency": "Low"},
        {"id": "RO078", "name": "Very Old Deck Triple", "power": 20.5, "brand": "Generic", "year": "1991", "efficiency": "Very Low"},
        {"id": "RO079", "name": "Convection Oven Half", "power": 3.5, "brand": "Southbend", "year": "2005", "efficiency": "Standard"},
        {"id": "RO080", "name": "Conveyor Pizza 18\"", "power": 18.0, "brand": "Lincoln", "year": "1999", "efficiency": "Low"},
        {"id": "RO081", "name": "Deck Oven Double Bakery", "power": 12.5, "brand": "Bakers Pride", "year": "2004", "efficiency": "Low"},
        {"id": "RO082", "name": "Old Combi Oven", "power": 22.0, "brand": "Generic", "year": "1995", "efficiency": "Very Low"},
        {"id": "RO083", "name": "Rapid Cook Microwave Combo", "power": 9.8, "brand": "TurboChef", "year": "2006", "efficiency": "Standard"},
        {"id": "RO084", "name": "Rotisserie 8-Spit", "power": 9.6, "brand": "Hickory", "year": "2001", "efficiency": "Low"},
        {"id": "RO085", "name": "Convection Oven Full", "power": 5.7, "brand": "Blodgett", "year": "2003", "efficiency": "Low"},
        {"id": "RO086", "name": "Massive Old Deck Oven", "power": 21.5, "brand": "Generic", "year": "1988", "efficiency": "Very Low"},
        {"id": "RO087", "name": "Range 10-Burner Heavy", "power": 4.0, "brand": "Garland", "year": "2002", "efficiency": "Low"},
        {"id": "RO088", "name": "Small Rapid Cook", "power": 7.2, "brand": "TurboChef", "year": "2006", "efficiency": "Standard"},
        {"id": "RO089", "name": "Deck Oven Four Stack", "power": 24.0, "brand": "Bakers Pride", "year": "2000", "efficiency": "Low"},
        {"id": "RO090", "name": "Cook & Hold Cabinet Large", "power": 8.2, "brand": "Alto-Shaam", "year": "2004", "efficiency": "Low"},
        {"id": "RO091", "name": "Old Deck Oven Double", "power": 15.0, "brand": "Generic", "year": "1996", "efficiency": "Very Low"},
        {"id": "RO092", "name": "Conveyor Oven 24\"", "power": 20.5, "brand": "Lincoln", "year": "2002", "efficiency": "Low"},
        {"id": "RO093", "name": "Vintage Combi Oven", "power": 28.0, "brand": "Generic", "year": "1993", "efficiency": "Very Low"},
        {"id": "RO094", "name": "Convection Oven Double Stack", "power": 11.0, "brand": "Southbend", "year": "2004", "efficiency": "Low"},
        {"id": "RO095", "name": "Countertop Convection Pro", "power": 2.8, "brand": "Cadco", "year": "2006", "efficiency": "Standard"},
        {"id": "RO096", "name": "Combi Oven 12-Pan", "power": 19.0, "brand": "Rational", "year": "2003", "efficiency": "Low"},
        {"id": "RO097", "name": "Range 6-Burner w/ Griddle", "power": 3.5, "brand": "Vulcan", "year": "2001", "efficiency": "Low"},
        {"id": "RO098", "name": "Deck Oven Pizza Triple", "power": 17.5, "brand": "Bakers Pride", "year": "1998", "efficiency": "Low"},
        {"id": "RO099", "name": "Convection Oven Basic", "power": 4.9, "brand": "Blodgett", "year": "2005", "efficiency": "Standard"},
        {"id": "RO100", "name": "Conveyor Oven Vintage", "power": 27.0, "brand": "Generic", "year": "1987", "efficiency": "Very Low"}
    ]
    
    # Convert to our format and add to existing products
    for oven in commercial_ovens:
        existing_products.append({
            "id": oven["id"],
            "name": oven["name"],
            "power": oven["power"],
            "type": "oven",
            "brand": oven["brand"],
            "year": oven["year"],
            "efficiency": oven["efficiency"],
            "icon": "🔥",
            "category": "current",
            "isCurated": oven["id"] in ["RO001", "RO002", "RO003", "RO004", "RO005", "RO006", "RO007"],  # First 7 are curated
            "displayName": f"Commercial {oven['name']}",
            "notes": "Commercial restaurant oven"
        })
    
    # Update the data structure
    data['products'] = existing_products
    data['totalProducts'] = len(existing_products)
    data['lastUpdated'] = datetime.now().isoformat() + "Z"
    
    # Count curated products
    curated_count = sum(1 for p in existing_products if p['isCurated'])
    data['curatedProducts'] = curated_count
    
    # Write updated file
    with open('commercial-products.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Updated commercial-products.json with {len(existing_products)} products")
    print(f"🎯 {curated_count} curated products for default display")
    
    # Show breakdown
    type_counts = {}
    for product in existing_products:
        ptype = product['type']
        type_counts[ptype] = type_counts.get(ptype, 0) + 1
    
    print("📊 Product type breakdown:")
    for ptype, count in type_counts.items():
        print(f"   {ptype}: {count}")

if __name__ == "__main__":
    add_commercial_ovens()









