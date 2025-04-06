# BMS Digital Signage - Botswana Context

This document provides important context for implementing the BMS Digital Signage system specifically for the Botswana market.

## Currency: Botswana Pula (BWP)

### Currency Basics
- Symbol: BWP or P
- Denominations: 10t, 50t, 1P, 2P, 5P, 10P, 20P, 50P, 100P, 200P
- Format: Always display as "BWP" followed by the amount with 2 decimal places
- Example: "BWP 42.50" (not "P42.50" or "42.50 BWP")

### Price Display Guidelines
- Include VAT in all displayed prices (standard rate: 14%)
- For special offers, show both the original and discounted price
- For bulk pricing, clearly label the quantity requirement
- School uniform pricing may vary by size (indicate size tier)

### Implementation Example
```typescript
// Format standard price
const formatPrice = (price: number): string => {
  return `BWP ${price.toFixed(2)}`;
};

// Format price with discount
const formatSpecialPrice = (currentPrice: number, originalPrice: number): string => {
  const savings = originalPrice - currentPrice;
  const discount = Math.round((savings / originalPrice) * 100);
  return `BWP ${currentPrice.toFixed(2)} (Save ${discount}%)`;
};

// Format tiered pricing (e.g. school uniforms with sizes)
const formatTieredPrice = (baseprice: number, tier: string): string => {
  return `${tier}: BWP ${baseprice.toFixed(2)}`;
};
```

## School System in Botswana

### Major School Types
- Government Schools: Public schools following the standard curriculum
- Private Schools: Including international systems (e.g., Cambridge)
- English Medium Schools: Focus on English-language instruction

### Common Schools in Gaborone (for Uniform Categories)
- Gaborone International School (GIS)
- Thornhill Primary School
- Northside Primary School
- Baobab School
- Westwood International School
- Maru-a-Pula School

### School Uniform Considerations
- Group uniforms by school name for easy navigation
- Include different components (shirts, pants/skirts, sports attire)
- Indicate size availability 
- Show school logos/colors with uniform items

## Seasonal Considerations for Botswana

### Key Retail Seasons
- **Back to School** (January and August): Major stationery sales period
- **Winter** (May-August): Winter uniform items become priority
- **Summer** (September-April): Summer uniform items in focus
- **Exam Period** (October-November): High demand for exam supplies

### Weather Context for Display
- Gaborone: Capital city (show weather by default)
- Francistown: Second largest city
- Maun: Tourism hub
- Kasane: Northern tourism center
- Lobatse: Southern town

## Localization Elements

### Languages
- **English**: Primary language for the interface
- **Setswana**: Consider including common phrases for welcome messages

### Time Format
- Use 12-hour clock format (e.g., 2:30 PM rather than 14:30)
- Include date in DD Month YYYY format (e.g., 03 April 2025)

### Store Announcements (Examples)
- "New term supplies now available"
- "School uniform fittings by appointment"
- "Exam preparation materials in stock"
- "Special orders available for school bulk purchases"

## Popular BMS Product Categories in Botswana

Based on research using Brave browser:

### Most Searched School & Office Supply Categories
1. **School Uniforms**: High demand, especially during school opening seasons
2. **Scientific Calculators**: Particularly Casio models for secondary schools
3. **Art Supplies**: Drawing materials and craft items
4. **Notebooks & Exercise Books**: Essential for all students
5. **Writing Instruments**: Pens, pencils, markers
6. **Book Covers & Labels**: For protecting school books
7. **School Bags**: Backpacks and laptop bags
8. **Office Organization**: Files, folders, and storage solutions

### BMS-Specific Offerings
- **STEAM Education**: Robotics and educational technology
- **Digital Printing Services**: Custom printing and binding
- **School Packages**: Pre-packaged supplies by grade level
- **Office Furniture**: For home and business settings

## Implementation Recommendations

1. **Currency Display**
   - Implement consistent BWP formatting across all prices
   - Show discounts as both absolute and percentage values

2. **School Categories**
   - Create main category for "School Uniforms"
   - Sub-categorize by specific schools (GIS, Thornhill, etc.)
   - Include size and component filters

3. **Seasonal Promotions**
   - Configure system to easily highlight seasonal items
   - Create "Back to School" promotional template
   - Implement "Exam Essentials" featured category

4. **Weather Integration**
   - Default to Gaborone weather
   - Include option to show weather for other major cities
   - Display temperature in Celsius

5. **Localization**
   - Use Botswana-appropriate date and time formats
   - Consider bilingual elements for key messages
   - Ensure all pricing follows local convention

By incorporating these Botswana-specific elements, the digital signage system will be properly contextualized for the local market and BMS customers.