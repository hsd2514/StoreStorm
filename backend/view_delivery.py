"""
Simple interactive delivery route visualizer
Run this after seeding data to open the delivery page in browser
"""
import webbrowser
import time

print("=" * 80)
print("🚀 DELIVERY ROUTE VIEWER - DRY RUN")
print("=" * 80)
print()
print("This will open the delivery management page in your browser where you can:")
print("  • View the delivery route for Rajesh Kumar")
print("  • See all 5 delivery stops on an interactive  map")
print("  • Click 'View Map' to see the Leaflet map with route visualization")
print("  • Transition delivery statuses")
print()
print("Make sure both servers are running:")
print("  ✓ Backend:  http://localhost:8000")
print("  ✓ Frontend: http://localhost:5173")
print()
input("Press ENTER to open the delivery page in your browser...")

# Open in browser
url = "http://localhost:5173/delivery"
print(f"\n🌐 Opening {url}...")
webbrowser.open(url)

print("\n" + "=" * 80)
print("✅ Delivery page opened!")
print("\n📋 What to do next:")
print("1. Look for the delivery batch card for 'Rajesh Kumar'")
print("2. You'll see:")
print("   • Batch number")
print("   • 5 delivery stops")
print("   • Total distance: 18.45 km")
print("   • Estimated time: 58 minutes")
print("3. Click the 'View Map' button to see the interactive route")
print("4. The map shows:")
print("   • Purple marker: Shop (starting point)")
print("   • Numbered markers: Delivery stops (1-5)")
print("   • Purple dashed line: Optimized route")
print("5. Click any marker to see customer details")
print("=" * 80)
