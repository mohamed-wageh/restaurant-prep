# Testing Guide - Restaurant Prep Manager

## 🚀 Quick Start

The development server should now be running. Open your browser and navigate to:
**http://localhost:5173** (or the URL shown in your terminal)

---

## 📋 Step-by-Step Testing Instructions

### Step 1: Set Up Your Data (Setup Page)

1. Navigate to the **Setup** page (click "Setup" in the navigation bar)

2. **Create Departments:**
   - In the "Departments" section, add:
     - `Bakery`
     - `Kitchen`
     - `Bar` (optional)

3. **Create Ingredients:**
   - In the "Ingredients" section, add ingredients with their departments:
     - Name: `Bun`, Unit: `piece`, Department: `Bakery`
     - Name: `Lanshon Slice`, Unit: `slice`, Department: `Kitchen`
     - Name: `Lettuce`, Unit: `leaf`, Department: `Kitchen`
     - Name: `Tomato`, Unit: `slice`, Department: `Kitchen`

4. **Create Menu Items:**
   - In the "Menu Items" section, add:
     - `Lanshon Sandwich`
     - `Cheese Sandwich` (optional, for testing)

### Step 2: Build Recipes (Recipes Page)

1. Navigate to the **Recipes** page (click "Recipes" in the navigation bar)

2. **Select "Lanshon Sandwich"** from the menu items

3. **Add ingredients to the recipe:**
   - Click "Add Ingredient to Recipe"
   - Select: `Bun`, Quantity: `1`
   - Click "Add to Recipe"
   - Select: `Lanshon Slice`, Quantity: `2`
   - Click "Add to Recipe"
   - Select: `Lettuce`, Quantity: `1` (optional)
   - Click "Add to Recipe"

4. You should now see the recipe displayed showing:
   - Bun - 1 piece
   - Lanshon Slice - 2 slice
   - Lettuce - 1 leaf

### Step 3: Test Order Calculator (Home Page)

1. Navigate to the **Home** page (click "Home" in the navigation bar)

2. **Build an Order:**
   - Select menu item: `Lanshon Sandwich`
   - Enter quantity: `200`
   - Click "Add to Order"
   - You should see "Lanshon Sandwich - Quantity: 200" in the order list

3. **Generate Prep List:**
   - Click the **"Generate Prep List"** button
   - You should see a report grouped by department:
     - **Bakery:**
       - Bun: 200 piece
     - **Kitchen:**
       - Lanshon Slice: 400 slice
       - Lettuce: 200 leaf

### Step 4: Test Multiple Items

1. Add another item to the order:
   - Select: `Lanshon Sandwich`
   - Quantity: `100`
   - Click "Add to Order"

2. Generate prep list again:
   - The totals should now be:
     - Bun: 300 piece (200 + 100)
     - Lanshon Slice: 600 slice (400 + 200)
     - Lettuce: 300 leaf (200 + 100)

---

## ✅ Expected Results

### Successful Test Scenario:
- ✅ Departments can be created, edited, and deleted
- ✅ Ingredients can be created with department assignment
- ✅ Menu items can be created
- ✅ Recipes can be built by adding ingredients
- ✅ Orders can be built by selecting menu items and quantities
- ✅ Prep list calculates correctly and groups by department
- ✅ Totals are accurate (recipe quantity × order quantity)

---

## 🔧 Troubleshooting

### If the app doesn't load:
1. Check that the dev server is running (should show URL in terminal)
2. Check browser console for errors
3. Verify Firebase credentials in `src/firebase.js`

### If Firestore operations fail:
1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: `restaurant-prep-manager`
3. Go to **Firestore Database**
4. Make sure Firestore is enabled
5. Check **Rules** tab - should allow read/write (for testing)

### If prep list is empty:
1. Make sure you've created recipes in the Recipes page
2. Verify that menu items have ingredients assigned
3. Check browser console for any errors

---

## 🎯 Test Checklist

- [ ] Can create departments
- [ ] Can create ingredients with department assignment
- [ ] Can create menu items
- [ ] Can build recipes by adding ingredients
- [ ] Can add items to order
- [ ] Can generate prep list
- [ ] Prep list shows correct totals
- [ ] Prep list groups by department correctly
- [ ] Can edit and delete items in Setup page
- [ ] Can remove items from order
- [ ] Can clear entire order

---

## 📝 Sample Data for Quick Testing

**Departments:**
- Bakery
- Kitchen

**Ingredients:**
- Bun (piece, Bakery)
- Lanshon Slice (slice, Kitchen)
- Lettuce (leaf, Kitchen)

**Menu Items:**
- Lanshon Sandwich

**Recipe for Lanshon Sandwich:**
- 1 Bun
- 2 Lanshon Slices
- 1 Lettuce

**Test Order:**
- 200 Lanshon Sandwiches

**Expected Prep List:**
- Bakery: 200 Buns
- Kitchen: 400 Lanshon Slices, 200 Lettuce leaves

