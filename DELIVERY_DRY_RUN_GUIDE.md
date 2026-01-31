# Delivery System - DRY RUN GUIDE

## 🚴 Experience the Delivery Route for Rajesh Kumar

Follow these steps to see the interactive delivery route with Leaflet maps:

### Step 1: Access the Application
1. Make sure both servers are running:
   - Backend: `cd backend && uv run fastapi dev main.py` ✅
   - Frontend: `cd frontend && npm run dev` ✅

2. Open http://localhost:5173 in your browser

### Step 2: Login
- Use your existing shop credentials
- Or create a new shop if needed

### Step 3: Create Sample Orders (if needed)
1. Go to **Orders** page
2. Click "**+ Create Order**" button
3. Create 3-5 test orders with different addresses:
   - Customer: "Priya Sharma", Address: "123 MG Road, Bangalore"
   - Customer: "Amit Verma", Address: "456 Brigade Road, Bangalore"
   - Customer: "Kavita Reddy", Address: "789 Koramangala, Bangalore"
   - etc.
4. Make sure to set status as "**Confirmed**"

### Step 4: Create Delivery Route
1. Go to **Delivery** page (`/delivery`)
2. Click "**+ Create Route**" button
3. In the modal:
   - ☑️ Select the confirmed orders (checkboxes)
   - 🎚️ Adjust crate capacity slider (default: 10)
   - 👤 Enter delivery partner details:
     - Name: **Rajesh Kumar**
     - Phone: **+91 98765 43210**
     - Vehicle: **Bike**
4. Click "**Create Route**" button

### Step 5: View Interactive Map
1. You'll see a new delivery card for Rajesh Kumar
2. The card shows:
   - Batch number
   - Number of stops
   - Total distance (km)
   - Estimated time
   - Crates used
   - Route status
3. Click the "**View Map**" button (or map icon)

### Step 6: Explore the Map
The interactive Leaflet map will display:
- 🟣 **Purple shop marker** (your starting point)
- 1️⃣2️⃣3️⃣ **Numbered stop markers** (delivery addresses)
  - Blue = Current stop
  - Gray = Pending
  - Green = Delivered
- **Purple dashed line** = Optimized route connecting all stops
- Click any marker to see customer details in a popup
- Zoom/pan to explore the route

### Step 7: Manage Delivery Status
Back on the delivery card, you can transition statuses:
- **"Mark Ready"** - Shop owner marks route ready for pickup
- **"Confirm Pickup"** - Rajesh Kumar picks up the crates
- **"Mark Delivered"** - Complete the delivery

---

## 🎯 What Makes This Special

1. **Crate-Based Batching**: Orders are grouped into physical crates based on capacity
2. **Smart Routing**: Nearest-neighbor TSP algorithm minimizes travel distance
3. **Locked Routes**: Once created, routes don't change (deterministic, no AI magic)
4. **Permission Validation**: Only authorized actors can change status
5. **Real Map Visualization**: See actual routes on OpenStreetMap

---

## 🗺️ Map Features

```
Shop (Start)
    ↓  [2.5 km]
Stop 1: Brigade Road (Current)
    ↓  [1.8 km]
Stop 2: MG Road (Pending)
    ↓  [3.2 km]
Stop 3: Koramangala (Pending)
    ↓  ...
```

---

## 💡 Tips

- Use realistic Bangalore addresses for better map visualization
- The system calculates distance using Haversine formula
- Route optimization happens automatically on creation
- Mock coordinates are generated from address hashes (in production, use geocoding API)

---

## 🐛 Troubleshooting

**No orders showing up?**
- Make sure orders are in "confirmed" status
- Check that they belong to your shop

**Can't create route?**
- Need at least 1 confirmed order
- Orders can only be in one route at a time

**Map not loading?**
- Check browser console for errors
- Verify Leaflet CSS is loaded (check Network tab)

---

Ready to see it in action? Open **http://localhost:5173/delivery** and start creating! 🚀
