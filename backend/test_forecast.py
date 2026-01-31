"""Test the forecasting API"""
import httpx
import asyncio

SHOP_ID = "697e104b00190c0dc4c2"
BASE_URL = "http://localhost:8000"

async def test_forecast():
    print("\n" + "="*60)
    print("📊 TESTING DEMAND FORECASTING")
    print("="*60)
    
    async with httpx.AsyncClient(timeout=30) as client:
        # Test full forecast
        print("\n🔮 Testing /forecasting/predict...")
        response = await client.get(f"{BASE_URL}/forecasting/predict/{SHOP_ID}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Forecast generated!")
            print(f"   Orders analyzed: {data['orders_analyzed']}")
            print(f"   Products tracked: {data['products_tracked']}")
            print(f"\n📦 Predictions:")
            for pred in data['predictions'][:5]:
                status = "⚠️" if pred['reorder_recommended'] else "✅"
                print(f"   {status} {pred['product_name']}: "
                      f"{pred['predicted_demand_7d']:.0f} units/week, "
                      f"Stock: {pred['current_stock']}, "
                      f"Days left: {pred['days_until_stockout']:.0f}")
            
            print(f"\n💡 Insights:")
            for insight in data.get('insights', [])[:3]:
                print(f"   • {insight}")
            
            print(f"\n⚠️ Risk Items: {', '.join(data.get('risk_items', [])) or 'None'}")
            
            print(f"\n📊 Summary:")
            print(f"   Items need reorder: {data['summary']['items_need_reorder']}")
            print(f"   Critical items: {data['summary']['items_critical']}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
        
        # Test quick insights
        print("\n⚡ Testing /forecasting/quick-insights...")
        response = await client.get(f"{BASE_URL}/forecasting/quick-insights/{SHOP_ID}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Quick insights:")
            print(f"   Total products: {data['summary']['total_products']}")
            print(f"   Needs attention: {data['summary']['needs_attention']}")
            
            if data['alerts']:
                print(f"\n🚨 Alerts:")
                for alert in data['alerts']:
                    print(f"   • {alert['message']}")
        else:
            print(f"❌ Error: {response.status_code}")

if __name__ == "__main__":
    asyncio.run(test_forecast())
