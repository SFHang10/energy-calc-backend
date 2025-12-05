#!/usr/bin/env python3
"""
Create commercial restaurant products JSON file with 200 commercial refrigeration units
"""

import json
from datetime import datetime

def create_commercial_products():
    products = []
    
    # Commercial Refrigerators (100 products)
    commercial_fridges = [
        {"id": "CR001", "name": "Single Door Reach-In", "power": 0.85, "brand": "True Manufacturing", "year": "1995", "efficiency": "Very Low"},
        {"id": "CR002", "name": "Double Door Upright", "power": 1.2, "brand": "Traulsen", "year": "1998", "efficiency": "Low"},
        {"id": "CR003", "name": "Three Door Reach-In", "power": 1.5, "brand": "Delfield", "year": "2000", "efficiency": "Low"},
        {"id": "CR004", "name": "Walk-In Cooler 8x10", "power": 2.8, "brand": "Kolpak", "year": "1992", "efficiency": "Very Low"},
        {"id": "CR005", "name": "Under Counter Fridge", "power": 0.65, "brand": "Turbo Air", "year": "2003", "efficiency": "Low"},
        {"id": "CR006", "name": "Glass Door Merchandiser", "power": 1.1, "brand": "True Manufacturing", "year": "2001", "efficiency": "Low"},
        {"id": "CR007", "name": "Two Door Reach-In", "power": 1.0, "brand": "Beverage-Air", "year": "1997", "efficiency": "Low"},
        {"id": "CR008", "name": "Pass-Through Refrigerator", "power": 1.4, "brand": "Traulsen", "year": "2004", "efficiency": "Low"},
        {"id": "CR009", "name": "Prep Table Refrigerated", "power": 0.75, "brand": "Delfield", "year": "2005", "efficiency": "Standard"},
        {"id": "CR010", "name": "Back Bar Cooler", "power": 0.55, "brand": "True Manufacturing", "year": "2002", "efficiency": "Low"},
        {"id": "CR011", "name": "Walk-In Cooler 10x12", "power": 3.2, "brand": "Kolpak", "year": "1999", "efficiency": "Very Low"},
        {"id": "CR012", "name": "Worktop Refrigerator", "power": 0.68, "brand": "Turbo Air", "year": "2006", "efficiency": "Standard"},
        {"id": "CR013", "name": "Four Door Reach-In", "power": 1.8, "brand": "Traulsen", "year": "1994", "efficiency": "Very Low"},
        {"id": "CR014", "name": "Old Walk-In 6x8", "power": 2.5, "brand": "Generic", "year": "1988", "efficiency": "Very Low"},
        {"id": "CR015", "name": "Single Glass Door", "power": 0.88, "brand": "True Manufacturing", "year": "2001", "efficiency": "Low"},
        {"id": "CR016", "name": "Sandwich Prep Table", "power": 0.72, "brand": "Delfield", "year": "2003", "efficiency": "Low"},
        {"id": "CR017", "name": "Double Glass Door", "power": 1.3, "brand": "Beverage-Air", "year": "1999", "efficiency": "Low"},
        {"id": "CR018", "name": "Compact Under Counter", "power": 0.48, "brand": "Turbo Air", "year": "2005", "efficiency": "Standard"},
        {"id": "CR019", "name": "Roll-In Refrigerator", "power": 1.6, "brand": "Traulsen", "year": "2000", "efficiency": "Low"},
        {"id": "CR020", "name": "Two Door Display", "power": 1.15, "brand": "True Manufacturing", "year": "1996", "efficiency": "Low"},
        {"id": "CR021", "name": "Walk-In Cooler 12x14", "power": 3.8, "brand": "Kolpak", "year": "1991", "efficiency": "Very Low"},
        {"id": "CR022", "name": "Pizza Prep Table", "power": 0.78, "brand": "Delfield", "year": "2004", "efficiency": "Low"},
        {"id": "CR023", "name": "Three Glass Door", "power": 1.45, "brand": "Beverage-Air", "year": "2002", "efficiency": "Low"},
        {"id": "CR024", "name": "Single Reach-In", "power": 0.82, "brand": "True Manufacturing", "year": "1998", "efficiency": "Low"},
        {"id": "CR025", "name": "Undercounter Dual", "power": 0.62, "brand": "Turbo Air", "year": "2006", "efficiency": "Standard"},
        {"id": "CR026", "name": "Pass-Through Double", "power": 1.35, "brand": "Traulsen", "year": "2001", "efficiency": "Low"},
        {"id": "CR027", "name": "Back Bar Triple", "power": 0.95, "brand": "True Manufacturing", "year": "1997", "efficiency": "Low"},
        {"id": "CR028", "name": "Walk-In Cooler 15x20", "power": 4.5, "brand": "Kolpak", "year": "1989", "efficiency": "Very Low"},
        {"id": "CR029", "name": "Salad Prep Refrigerator", "power": 0.74, "brand": "Delfield", "year": "2004", "efficiency": "Low"},
        {"id": "CR030", "name": "Five Door Reach-In", "power": 2.1, "brand": "Traulsen", "year": "2003", "efficiency": "Low"},
        {"id": "CR031", "name": "Display Merchandiser", "power": 1.25, "brand": "Beverage-Air", "year": "2005", "efficiency": "Standard"},
        {"id": "CR032", "name": "Compact Worktop", "power": 0.52, "brand": "Turbo Air", "year": "2006", "efficiency": "Standard"},
        {"id": "CR033", "name": "Half Door Reach-In", "power": 0.92, "brand": "True Manufacturing", "year": "1999", "efficiency": "Low"},
        {"id": "CR034", "name": "Walk-In Cooler 8x12", "power": 3.0, "brand": "Kolpak", "year": "1995", "efficiency": "Very Low"},
        {"id": "CR035", "name": "Mega Top Prep Table", "power": 0.88, "brand": "Delfield", "year": "2000", "efficiency": "Low"},
        {"id": "CR036", "name": "Solid Door Double", "power": 1.12, "brand": "Beverage-Air", "year": "2002", "efficiency": "Low"},
        {"id": "CR037", "name": "Roll-Through Cooler", "power": 1.55, "brand": "Traulsen", "year": "2001", "efficiency": "Low"},
        {"id": "CR038", "name": "Bar Refrigerator", "power": 0.58, "brand": "True Manufacturing", "year": "2005", "efficiency": "Standard"},
        {"id": "CR039", "name": "Old Four Door", "power": 2.0, "brand": "Generic", "year": "1993", "efficiency": "Very Low"},
        {"id": "CR040", "name": "Two Door Pass-Through", "power": 1.28, "brand": "Traulsen", "year": "2003", "efficiency": "Low"},
        {"id": "CR041", "name": "Walk-In Cooler 10x10", "power": 3.1, "brand": "Kolpak", "year": "2000", "efficiency": "Low"},
        {"id": "CR042", "name": "Sandwich Unit", "power": 0.70, "brand": "Delfield", "year": "1998", "efficiency": "Low"},
        {"id": "CR043", "name": "Three Door Display", "power": 1.4, "brand": "Beverage-Air", "year": "2006", "efficiency": "Standard"},
        {"id": "CR044", "name": "Heavy Duty Reach-In", "power": 1.65, "brand": "Traulsen", "year": "1996", "efficiency": "Very Low"},
        {"id": "CR045", "name": "Chef Base Refrigerator", "power": 0.66, "brand": "Turbo Air", "year": "2004", "efficiency": "Low"},
        {"id": "CR046", "name": "Walk-In Cooler 20x20", "power": 5.2, "brand": "Kolpak", "year": "1997", "efficiency": "Very Low"},
        {"id": "CR047", "name": "Dual Temp Reach-In", "power": 1.38, "brand": "True Manufacturing", "year": "2002", "efficiency": "Low"},
        {"id": "CR048", "name": "Small Prep Table", "power": 0.54, "brand": "Delfield", "year": "2005", "efficiency": "Standard"},
        {"id": "CR049", "name": "Vintage Walk-In 10x15", "power": 4.8, "brand": "Generic", "year": "1990", "efficiency": "Very Low"},
        {"id": "CR050", "name": "Glass Front Cooler", "power": 1.22, "brand": "Beverage-Air", "year": "2001", "efficiency": "Low"},
        {"id": "CR051", "name": "Single Door Commercial", "power": 0.86, "brand": "True Manufacturing", "year": "2004", "efficiency": "Low"},
        {"id": "CR052", "name": "Walk-In Cooler 12x16", "power": 3.6, "brand": "Kolpak", "year": "2000", "efficiency": "Low"},
        {"id": "CR053", "name": "Under Counter Double", "power": 0.64, "brand": "Turbo Air", "year": "2006", "efficiency": "Standard"},
        {"id": "CR054", "name": "Four Door Glass", "power": 1.75, "brand": "Beverage-Air", "year": "2003", "efficiency": "Low"},
        {"id": "CR055", "name": "Old Reach-In Double", "power": 1.35, "brand": "Generic", "year": "1997", "efficiency": "Very Low"},
        {"id": "CR056", "name": "Worktop Two Door", "power": 0.76, "brand": "Delfield", "year": "2002", "efficiency": "Low"},
        {"id": "CR057", "name": "Walk-In Cooler 18x24", "power": 4.9, "brand": "Kolpak", "year": "1992", "efficiency": "Very Low"},
        {"id": "CR058", "name": "Standard Reach-In", "power": 0.90, "brand": "True Manufacturing", "year": "2004", "efficiency": "Low"},
        {"id": "CR059", "name": "Compact Chef Base", "power": 0.49, "brand": "Turbo Air", "year": "2006", "efficiency": "Standard"},
        {"id": "CR060", "name": "Six Door Reach-In", "power": 2.4, "brand": "Traulsen", "year": "2002", "efficiency": "Low"},
        {"id": "CR061", "name": "Back Bar Cooler Double", "power": 0.72, "brand": "True Manufacturing", "year": "1999", "efficiency": "Low"},
        {"id": "CR062", "name": "Two Door Standard", "power": 1.08, "brand": "Beverage-Air", "year": "2003", "efficiency": "Low"},
        {"id": "CR063", "name": "Walk-In Cooler 9x11", "power": 2.9, "brand": "Kolpak", "year": "2001", "efficiency": "Low"},
        {"id": "CR064", "name": "Pizza Prep Station", "power": 0.68, "brand": "Delfield", "year": "2005", "efficiency": "Standard"},
        {"id": "CR065", "name": "Three Door Commercial", "power": 1.48, "brand": "True Manufacturing", "year": "2000", "efficiency": "Low"},
        {"id": "CR066", "name": "Walk-In Cooler 14x18", "power": 4.2, "brand": "Kolpak", "year": "1994", "efficiency": "Very Low"},
        {"id": "CR067", "name": "Display Cooler Four Door", "power": 1.68, "brand": "Beverage-Air", "year": "2004", "efficiency": "Low"},
        {"id": "CR068", "name": "Small Under Counter", "power": 0.46, "brand": "Turbo Air", "year": "2006", "efficiency": "Standard"},
        {"id": "CR069", "name": "Old Three Door", "power": 1.62, "brand": "Generic", "year": "1998", "efficiency": "Low"},
        {"id": "CR070", "name": "Pass-Through Single", "power": 0.98, "brand": "Traulsen", "year": "2002", "efficiency": "Low"},
        {"id": "CR071", "name": "Walk-In Cooler 16x20", "power": 4.6, "brand": "Kolpak", "year": "2001", "efficiency": "Low"},
        {"id": "CR072", "name": "Standard Two Door", "power": 1.05, "brand": "True Manufacturing", "year": "2004", "efficiency": "Low"},
        {"id": "CR073", "name": "Vintage Commercial", "power": 2.2, "brand": "Generic", "year": "1989", "efficiency": "Very Low"},
        {"id": "CR074", "name": "Prep Refrigerator", "power": 0.80, "brand": "Delfield", "year": "2003", "efficiency": "Low"},
        {"id": "CR075", "name": "Under Counter Single", "power": 0.56, "brand": "Turbo Air", "year": "2006", "efficiency": "Standard"},
        {"id": "CR076", "name": "Four Door Standard", "power": 1.72, "brand": "Traulsen", "year": "2000", "efficiency": "Low"},
        {"id": "CR077", "name": "Back Bar Three Door", "power": 0.88, "brand": "True Manufacturing", "year": "2003", "efficiency": "Low"},
        {"id": "CR078", "name": "Walk-In Cooler 22x22", "power": 5.4, "brand": "Kolpak", "year": "1991", "efficiency": "Very Low"},
        {"id": "CR079", "name": "Worktop Single", "power": 0.60, "brand": "Delfield", "year": "2005", "efficiency": "Standard"},
        {"id": "CR080", "name": "Double Door Glass", "power": 1.32, "brand": "Beverage-Air", "year": "1999", "efficiency": "Low"},
        {"id": "CR081", "name": "Reach-In Standard", "power": 0.94, "brand": "True Manufacturing", "year": "2004", "efficiency": "Low"},
        {"id": "CR082", "name": "Walk-In Cooler 11x13", "power": 3.4, "brand": "Kolpak", "year": "1995", "efficiency": "Very Low"},
        {"id": "CR083", "name": "Sandwich Prep Unit", "power": 0.71, "brand": "Delfield", "year": "2006", "efficiency": "Standard"},
        {"id": "CR084", "name": "Five Door Glass", "power": 1.95, "brand": "Beverage-Air", "year": "2001", "efficiency": "Low"},
        {"id": "CR085", "name": "Three Door Standard", "power": 1.42, "brand": "Traulsen", "year": "2003", "efficiency": "Low"},
        {"id": "CR086", "name": "Walk-In Cooler 25x30", "power": 6.2, "brand": "Kolpak", "year": "1988", "efficiency": "Very Low"},
        {"id": "CR087", "name": "Dual Door Reach-In", "power": 1.18, "brand": "True Manufacturing", "year": "2002", "efficiency": "Low"},
        {"id": "CR088", "name": "Small Worktop", "power": 0.51, "brand": "Turbo Air", "year": "2006", "efficiency": "Standard"},
        {"id": "CR089", "name": "Walk-In Cooler 13x15", "power": 3.7, "brand": "Kolpak", "year": "2000", "efficiency": "Low"},
        {"id": "CR090", "name": "Chef Base Double", "power": 0.73, "brand": "Delfield", "year": "2004", "efficiency": "Low"},
        {"id": "CR091", "name": "Old Walk-In 12x12", "power": 3.9, "brand": "Generic", "year": "1996", "efficiency": "Very Low"},
        {"id": "CR092", "name": "Two Door Reach-In", "power": 1.10, "brand": "Beverage-Air", "year": "2002", "efficiency": "Low"},
        {"id": "CR093", "name": "Walk-In Cooler 17x19", "power": 4.7, "brand": "Kolpak", "year": "1993", "efficiency": "Very Low"},
        {"id": "CR094", "name": "Standard Pass-Through", "power": 1.24, "brand": "Traulsen", "year": "2004", "efficiency": "Low"},
        {"id": "CR095", "name": "Under Counter Prep", "power": 0.59, "brand": "Turbo Air", "year": "2006", "efficiency": "Standard"},
        {"id": "CR096", "name": "Four Door Display", "power": 1.78, "brand": "Beverage-Air", "year": "2003", "efficiency": "Low"},
        {"id": "CR097", "name": "Single Door Heavy Duty", "power": 0.96, "brand": "True Manufacturing", "year": "2001", "efficiency": "Low"},
        {"id": "CR098", "name": "Walk-In Cooler 15x18", "power": 4.3, "brand": "Kolpak", "year": "1998", "efficiency": "Low"},
        {"id": "CR099", "name": "Prep Table Standard", "power": 0.67, "brand": "Delfield", "year": "2005", "efficiency": "Standard"},
        {"id": "CR100", "name": "Walk-In Cooler 20x25", "power": 5.8, "brand": "Kolpak", "year": "1987", "efficiency": "Very Low"}
    ]
    
    # Commercial Freezers (100 products)
    commercial_freezers = [
        {"id": "CF001", "name": "Single Door Reach-In", "power": 0.95, "brand": "True Manufacturing", "year": "1995", "efficiency": "Very Low"},
        {"id": "CF002", "name": "Double Door Upright", "power": 1.4, "brand": "Traulsen", "year": "1998", "efficiency": "Low"},
        {"id": "CF003", "name": "Three Door Reach-In", "power": 1.8, "brand": "Delfield", "year": "2000", "efficiency": "Low"},
        {"id": "CF004", "name": "Walk-In Freezer 8x10", "power": 3.5, "brand": "Kolpak", "year": "1992", "efficiency": "Very Low"},
        {"id": "CF005", "name": "Under Counter Freezer", "power": 0.72, "brand": "Turbo Air", "year": "2003", "efficiency": "Low"},
        {"id": "CF006", "name": "Glass Door Display", "power": 1.3, "brand": "True Manufacturing", "year": "2001", "efficiency": "Low"},
        {"id": "CF007", "name": "Two Door Reach-In", "power": 1.2, "brand": "Beverage-Air", "year": "1997", "efficiency": "Low"},
        {"id": "CF008", "name": "Pass-Through Freezer", "power": 1.65, "brand": "Traulsen", "year": "2004", "efficiency": "Low"},
        {"id": "CF009", "name": "Chest Freezer Commercial", "power": 0.88, "brand": "Nor-Lake", "year": "2005", "efficiency": "Standard"},
        {"id": "CF010", "name": "Undercounter Freezer", "power": 0.68, "brand": "True Manufacturing", "year": "2002", "efficiency": "Low"},
        {"id": "CF011", "name": "Walk-In Freezer 10x12", "power": 4.2, "brand": "Kolpak", "year": "1999", "efficiency": "Very Low"},
        {"id": "CF012", "name": "Worktop Freezer", "power": 0.75, "brand": "Turbo Air", "year": "2006", "efficiency": "Standard"},
        {"id": "CF013", "name": "Four Door Reach-In", "power": 2.2, "brand": "Traulsen", "year": "1994", "efficiency": "Very Low"},
        {"id": "CF014", "name": "Old Walk-In 6x8", "power": 3.1, "brand": "Generic", "year": "1988", "efficiency": "Very Low"},
        {"id": "CF015", "name": "Single Glass Door", "power": 1.05, "brand": "True Manufacturing", "year": "2001", "efficiency": "Low"},
        {"id": "CF016", "name": "Ice Cream Dipping Cabinet", "power": 0.82, "brand": "Delfield", "year": "2003", "efficiency": "Low"},
        {"id": "CF017", "name": "Double Glass Door", "power": 1.55, "brand": "Beverage-Air", "year": "1999", "efficiency": "Low"},
        {"id": "CF018", "name": "Compact Under Counter", "power": 0.58, "brand": "Turbo Air", "year": "2005", "efficiency": "Standard"},
        {"id": "CF019", "name": "Roll-In Freezer", "power": 1.9, "brand": "Traulsen", "year": "2000", "efficiency": "Low"},
        {"id": "CF020", "name": "Two Door Display", "power": 1.35, "brand": "True Manufacturing", "year": "1996", "efficiency": "Low"},
        {"id": "CF021", "name": "Walk-In Freezer 12x14", "power": 4.8, "brand": "Kolpak", "year": "1991", "efficiency": "Very Low"},
        {"id": "CF022", "name": "Horizontal Chest", "power": 0.92, "brand": "Nor-Lake", "year": "2004", "efficiency": "Low"},
        {"id": "CF023", "name": "Three Glass Door", "power": 1.72, "brand": "Beverage-Air", "year": "2002", "efficiency": "Low"},
        {"id": "CF024", "name": "Single Reach-In", "power": 0.98, "brand": "True Manufacturing", "year": "1998", "efficiency": "Low"},
        {"id": "CF025", "name": "Undercounter Dual", "power": 0.74, "brand": "Turbo Air", "year": "2006", "efficiency": "Standard"},
        {"id": "CF026", "name": "Pass-Through Double", "power": 1.58, "brand": "Traulsen", "year": "2001", "efficiency": "Low"},
        {"id": "CF027", "name": "Ice Cream Freezer", "power": 1.12, "brand": "True Manufacturing", "year": "1997", "efficiency": "Low"},
        {"id": "CF028", "name": "Walk-In Freezer 15x20", "power": 5.8, "brand": "Kolpak", "year": "1989", "efficiency": "Very Low"},
        {"id": "CF029", "name": "Prep Freezer", "power": 0.86, "brand": "Delfield", "year": "2004", "efficiency": "Low"},
        {"id": "CF030", "name": "Five Door Reach-In", "power": 2.6, "brand": "Traulsen", "year": "2003", "efficiency": "Low"},
        {"id": "CF031", "name": "Display Merchandiser", "power": 1.48, "brand": "Beverage-Air", "year": "2005", "efficiency": "Standard"},
        {"id": "CF032", "name": "Compact Worktop", "power": 0.62, "brand": "Turbo Air", "year": "2006", "efficiency": "Standard"},
        {"id": "CF033", "name": "Half Door Reach-In", "power": 1.08, "brand": "True Manufacturing", "year": "1999", "efficiency": "Low"},
        {"id": "CF034", "name": "Walk-In Freezer 8x12", "power": 3.8, "brand": "Kolpak", "year": "1995", "efficiency": "Very Low"},
        {"id": "CF035", "name": "Chest Freezer Large", "power": 1.02, "brand": "Nor-Lake", "year": "2000", "efficiency": "Low"},
        {"id": "CF036", "name": "Solid Door Double", "power": 1.32, "brand": "Beverage-Air", "year": "2002", "efficiency": "Low"},
        {"id": "CF037", "name": "Roll-Through Freezer", "power": 1.85, "brand": "Traulsen", "year": "2001", "efficiency": "Low"},
        {"id": "CF038", "name": "Undercounter Single", "power": 0.65, "brand": "True Manufacturing", "year": "2005", "efficiency": "Standard"},
        {"id": "CF039", "name": "Old Four Door", "power": 2.4, "brand": "Generic", "year": "1993", "efficiency": "Very Low"},
        {"id": "CF040", "name": "Two Door Pass-Through", "power": 1.52, "brand": "Traulsen", "year": "2003", "efficiency": "Low"},
        {"id": "CF041", "name": "Walk-In Freezer 10x10", "power": 4.0, "brand": "Kolpak", "year": "2000", "efficiency": "Low"},
        {"id": "CF042", "name": "Ice Cream Cabinet", "power": 0.94, "brand": "Delfield", "year": "1998", "efficiency": "Low"},
        {"id": "CF043", "name": "Three Door Display", "power": 1.68, "brand": "Beverage-Air", "year": "2006", "efficiency": "Standard"},
        {"id": "CF044", "name": "Heavy Duty Reach-In", "power": 1.92, "brand": "Traulsen", "year": "1996", "efficiency": "Very Low"},
        {"id": "CF045", "name": "Chest Freezer Standard", "power": 0.79, "brand": "Nor-Lake", "year": "2004", "efficiency": "Low"},
        {"id": "CF046", "name": "Walk-In Freezer 20x20", "power": 6.8, "brand": "Kolpak", "year": "1997", "efficiency": "Very Low"},
        {"id": "CF047", "name": "Dual Temp Reach-In", "power": 1.62, "brand": "True Manufacturing", "year": "2002", "efficiency": "Low"},
        {"id": "CF048", "name": "Small Under Counter", "power": 0.60, "brand": "Turbo Air", "year": "2005", "efficiency": "Standard"},
        {"id": "CF049", "name": "Vintage Walk-In 10x15", "power": 6.2, "brand": "Generic", "year": "1990", "efficiency": "Very Low"},
        {"id": "CF050", "name": "Glass Front Freezer", "power": 1.45, "brand": "Beverage-Air", "year": "2001", "efficiency": "Low"},
        {"id": "CF051", "name": "Single Door Commercial", "power": 1.02, "brand": "True Manufacturing", "year": "2004", "efficiency": "Low"},
        {"id": "CF052", "name": "Walk-In Freezer 12x16", "power": 4.6, "brand": "Kolpak", "year": "2000", "efficiency": "Low"},
        {"id": "CF053", "name": "Under Counter Double", "power": 0.76, "brand": "Turbo Air", "year": "2006", "efficiency": "Standard"},
        {"id": "CF054", "name": "Four Door Glass", "power": 2.1, "brand": "Beverage-Air", "year": "2003", "efficiency": "Low"},
        {"id": "CF055", "name": "Old Reach-In Double", "power": 1.58, "brand": "Generic", "year": "1997", "efficiency": "Very Low"},
        {"id": "CF056", "name": "Worktop Two Door", "power": 0.88, "brand": "Delfield", "year": "2002", "efficiency": "Low"},
        {"id": "CF057", "name": "Walk-In Freezer 18x24", "power": 6.4, "brand": "Kolpak", "year": "1992", "efficiency": "Very Low"},
        {"id": "CF058", "name": "Standard Reach-In", "power": 1.06, "brand": "True Manufacturing", "year": "2004", "efficiency": "Low"},
        {"id": "CF059", "name": "Compact Chest", "power": 0.56, "brand": "Nor-Lake", "year": "2006", "efficiency": "Standard"},
        {"id": "CF060", "name": "Six Door Reach-In", "power": 2.9, "brand": "Traulsen", "year": "2002", "efficiency": "Low"},
        {"id": "CF061", "name": "Display Freezer Double", "power": 1.38, "brand": "True Manufacturing", "year": "1999", "efficiency": "Low"},
        {"id": "CF062", "name": "Two Door Standard", "power": 1.28, "brand": "Beverage-Air", "year": "2003", "efficiency": "Low"},
        {"id": "CF063", "name": "Walk-In Freezer 9x11", "power": 3.7, "brand": "Kolpak", "year": "2001", "efficiency": "Low"},
        {"id": "CF064", "name": "Ice Cream Display", "power": 0.96, "brand": "Delfield", "year": "2005", "efficiency": "Standard"},
        {"id": "CF065", "name": "Three Door Commercial", "power": 1.75, "brand": "True Manufacturing", "year": "2000", "efficiency": "Low"},
        {"id": "CF066", "name": "Walk-In Freezer 14x18", "power": 5.4, "brand": "Kolpak", "year": "1994", "efficiency": "Very Low"},
        {"id": "CF067", "name": "Display Freezer Four Door", "power": 2.05, "brand": "Beverage-Air", "year": "2004", "efficiency": "Low"},
        {"id": "CF068", "name": "Small Under Counter", "power": 0.54, "brand": "Turbo Air", "year": "2006", "efficiency": "Standard"},
        {"id": "CF069", "name": "Old Three Door", "power": 1.88, "brand": "Generic", "year": "1998", "efficiency": "Low"},
        {"id": "CF070", "name": "Pass-Through Single", "power": 1.15, "brand": "Traulsen", "year": "2002", "efficiency": "Low"},
        {"id": "CF071", "name": "Walk-In Freezer 16x20", "power": 5.9, "brand": "Kolpak", "year": "2001", "efficiency": "Low"},
        {"id": "CF072", "name": "Standard Two Door", "power": 1.24, "brand": "True Manufacturing", "year": "2004", "efficiency": "Low"},
        {"id": "CF073", "name": "Vintage Commercial", "power": 2.7, "brand": "Generic", "year": "1989", "efficiency": "Very Low"},
        {"id": "CF074", "name": "Chest Freezer Deep", "power": 0.84, "brand": "Nor-Lake", "year": "2003", "efficiency": "Low"},
        {"id": "CF075", "name": "Under Counter Single", "power": 0.66, "brand": "Turbo Air", "year": "2006", "efficiency": "Standard"},
        {"id": "CF076", "name": "Four Door Standard", "power": 2.0, "brand": "Traulsen", "year": "2000", "efficiency": "Low"},
        {"id": "CF077", "name": "Ice Cream Reach-In", "power": 1.18, "brand": "True Manufacturing", "year": "2003", "efficiency": "Low"},
        {"id": "CF078", "name": "Walk-In Freezer 22x22", "power": 7.2, "brand": "Kolpak", "year": "1991", "efficiency": "Very Low"},
        {"id": "CF079", "name": "Worktop Single", "power": 0.70, "brand": "Delfield", "year": "2005", "efficiency": "Standard"},
        {"id": "CF080", "name": "Double Door Glass", "power": 1.58, "brand": "Beverage-Air", "year": "1999", "efficiency": "Low"},
        {"id": "CF081", "name": "Reach-In Standard", "power": 1.10, "brand": "True Manufacturing", "year": "2004", "efficiency": "Low"},
        {"id": "CF082", "name": "Walk-In Freezer 11x13", "power": 4.4, "brand": "Kolpak", "year": "1995", "efficiency": "Very Low"},
        {"id": "CF083", "name": "Horizontal Display", "power": 0.90, "brand": "Nor-Lake", "year": "2006", "efficiency": "Standard"},
        {"id": "CF084", "name": "Five Door Glass", "power": 2.35, "brand": "Beverage-Air", "year": "2001", "efficiency": "Low"},
        {"id": "CF085", "name": "Three Door Standard", "power": 1.68, "brand": "Traulsen", "year": "2003", "efficiency": "Low"},
        {"id": "CF086", "name": "Walk-In Freezer 25x30", "power": 8.2, "brand": "Kolpak", "year": "1988", "efficiency": "Very Low"},
        {"id": "CF087", "name": "Dual Door Reach-In", "power": 1.38, "brand": "True Manufacturing", "year": "2002", "efficiency": "Low"},
        {"id": "CF088", "name": "Small Worktop", "power": 0.59, "brand": "Turbo Air", "year": "2006", "efficiency": "Standard"},
        {"id": "CF089", "name": "Walk-In Freezer 13x15", "power": 4.8, "brand": "Kolpak", "year": "2000", "efficiency": "Low"},
        {"id": "CF090", "name": "Chest Freezer Heavy Duty", "power": 0.98, "brand": "Nor-Lake", "year": "2004", "efficiency": "Low"},
        {"id": "CF091", "name": "Old Walk-In 12x12", "power": 5.1, "brand": "Generic", "year": "1996", "efficiency": "Very Low"},
        {"id": "CF092", "name": "Two Door Reach-In", "power": 1.30, "brand": "Beverage-Air", "year": "2002", "efficiency": "Low"},
        {"id": "CF093", "name": "Walk-In Freezer 17x19", "power": 6.1, "brand": "Kolpak", "year": "1993", "efficiency": "Very Low"},
        {"id": "CF094", "name": "Standard Pass-Through", "power": 1.48, "brand": "Traulsen", "year": "2004", "efficiency": "Low"},
        {"id": "CF095", "name": "Under Counter Prep", "power": 0.69, "brand": "Turbo Air", "year": "2006", "efficiency": "Standard"},
        {"id": "CF096", "name": "Four Door Display", "power": 2.15, "brand": "Beverage-Air", "year": "2003", "efficiency": "Low"},
        {"id": "CF097", "name": "Single Door Heavy Duty", "power": 1.12, "brand": "True Manufacturing", "year": "2001", "efficiency": "Low"},
        {"id": "CF098", "name": "Walk-In Freezer 15x18", "power": 5.6, "brand": "Kolpak", "year": "1998", "efficiency": "Low"},
        {"id": "CF099", "name": "Chest Freezer Standard", "power": 0.81, "brand": "Nor-Lake", "year": "2005", "efficiency": "Standard"},
        {"id": "CF100", "name": "Walk-In Freezer 20x25", "power": 7.6, "brand": "Kolpak", "year": "1987", "efficiency": "Very Low"}
    ]
    
    # Convert to our format and add to products list
    for fridge in commercial_fridges:
        products.append({
            "id": fridge["id"],
            "name": fridge["name"],
            "power": fridge["power"],
            "type": "fridge",
            "brand": fridge["brand"],
            "year": fridge["year"],
            "efficiency": fridge["efficiency"],
            "icon": "🧊",
            "category": "current",
            "isCurated": fridge["id"] in ["CR001", "CR002", "CR003", "CR004", "CR005", "CR006", "CR007"],  # First 7 are curated
            "displayName": f"Commercial {fridge['name']}",
            "notes": "Commercial restaurant refrigeration"
        })
    
    for freezer in commercial_freezers:
        products.append({
            "id": freezer["id"],
            "name": freezer["name"],
            "power": freezer["power"],
            "type": "freezer",
            "brand": freezer["brand"],
            "year": freezer["year"],
            "efficiency": freezer["efficiency"],
            "icon": "❄️",
            "category": "current",
            "isCurated": freezer["id"] in ["CF001", "CF002", "CF003", "CF004", "CF005", "CF006", "CF007"],  # First 7 are curated
            "displayName": f"Commercial {freezer['name']}",
            "notes": "Commercial restaurant freezer"
        })
    
    return products

def main():
    print("🔄 Creating commercial restaurant products JSON with 200 products...")
    
    products = create_commercial_products()
    
    # Count curated products
    curated_count = sum(1 for p in products if p['isCurated'])
    
    # Create the full data structure
    data = {
        "lastUpdated": datetime.now().isoformat() + "Z",
        "totalProducts": len(products),
        "description": "Commercial restaurant refrigeration equipment for comparison against modern ETL-certified alternatives",
        "curatedProducts": curated_count,
        "products": products
    }
    
    # Write to file
    with open('commercial-products.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Created commercial-products.json with {len(products)} products")
    print(f"🎯 {curated_count} curated products for default display")
    
    # Show breakdown
    type_counts = {}
    for product in products:
        ptype = product['type']
        type_counts[ptype] = type_counts.get(ptype, 0) + 1
    
    print("📊 Product type breakdown:")
    for ptype, count in type_counts.items():
        print(f"   {ptype}: {count}")

if __name__ == "__main__":
    main()









