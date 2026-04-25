import asyncio
from db.postgres import engine, Base, AsyncSessionLocal, Account, Transaction, Alert

accounts_data = [
    {"id": "A001", "name": "Rajesh Mehta", "type": "Corporate", "risk": "fraud", "risk_score": 84, "declared_income": "₹6,00,000", "inflow_30d": "₹18,45,000", "outflow_30d": "₹17,80,000", "connections": 5},
    {"id": "A002", "name": "Shell Corp A", "type": "Corporate", "risk": "fraud", "risk_score": 92, "declared_income": "Not Declared", "inflow_30d": "₹12,30,000", "outflow_30d": "₹12,25,000", "connections": 3},
    {"id": "A003", "name": "Dormant 7823", "type": "Savings", "risk": "suspicious", "risk_score": 71, "declared_income": "₹2,50,000", "inflow_30d": "₹9,80,000", "outflow_30d": "₹9,75,000", "connections": 2},
    {"id": "A004", "name": "Partner Entity B", "type": "Current", "risk": "suspicious", "risk_score": 65, "declared_income": "₹15,00,000", "inflow_30d": "₹8,40,000", "outflow_30d": "₹7,90,000", "connections": 4},
    {"id": "A005", "name": "Priya Sharma", "type": "Savings", "risk": "clean", "risk_score": 12, "declared_income": "₹8,00,000", "inflow_30d": "₹3,20,000", "outflow_30d": "₹2,80,000", "connections": 3},
    {"id": "A006", "name": "Amit Patel", "type": "Savings", "risk": "clean", "risk_score": 8, "declared_income": "₹5,50,000", "inflow_30d": "₹2,10,000", "outflow_30d": "₹1,90,000", "connections": 2},
    {"id": "A007", "name": "Kumar Trading", "type": "Corporate", "risk": "suspicious", "risk_score": 58, "declared_income": "₹20,00,000", "inflow_30d": "₹14,50,000", "outflow_30d": "₹14,20,000", "connections": 6},
    {"id": "A008", "name": "Dormant 4521", "type": "Savings", "risk": "dormant", "risk_score": 5, "declared_income": "₹3,00,000", "inflow_30d": "₹45,000", "outflow_30d": "₹0", "connections": 1},
    {"id": "A009", "name": "Sunita Devi", "type": "Savings", "risk": "clean", "risk_score": 15, "declared_income": "₹4,00,000", "inflow_30d": "₹1,80,000", "outflow_30d": "₹1,60,000", "connections": 2},
    {"id": "A010", "name": "Fast Traders LLC", "type": "Corporate", "risk": "suspicious", "risk_score": 62, "declared_income": "₹50,00,000", "inflow_30d": "₹32,00,000", "outflow_30d": "₹31,50,000", "connections": 7},
    {"id": "A011", "name": "Neha Gupta", "type": "Savings", "risk": "clean", "risk_score": 10, "declared_income": "₹7,00,000", "inflow_30d": "₹2,50,000", "outflow_30d": "₹2,20,000", "connections": 2},
    {"id": "A012", "name": "Shell Corp B", "type": "Corporate", "risk": "fraud", "risk_score": 88, "declared_income": "Not Declared", "inflow_30d": "₹8,90,000", "outflow_30d": "₹8,85,000", "connections": 3},
    {"id": "A013", "name": "Vikram Singh", "type": "Current", "risk": "clean", "risk_score": 18, "declared_income": "₹12,00,000", "inflow_30d": "₹5,60,000", "outflow_30d": "₹4,90,000", "connections": 4},
    {"id": "A014", "name": "Dormant 9102", "type": "Savings", "risk": "dormant", "risk_score": 3, "declared_income": "₹2,00,000", "inflow_30d": "₹0", "outflow_30d": "₹0", "connections": 0},
    {"id": "A015", "name": "Ravi Textiles", "type": "Corporate", "risk": "clean", "risk_score": 22, "declared_income": "₹35,00,000", "inflow_30d": "₹18,00,000", "outflow_30d": "₹17,00,000", "connections": 5},
    {"id": "A016", "name": "Mule Account X1", "type": "Savings", "risk": "fraud", "risk_score": 95, "declared_income": "₹1,80,000", "inflow_30d": "₹45,00,000", "outflow_30d": "₹44,90,000", "connections": 8},
    {"id": "A017", "name": "Deepak Exports", "type": "Corporate", "risk": "suspicious", "risk_score": 55, "declared_income": "₹80,00,000", "inflow_30d": "₹42,00,000", "outflow_30d": "₹41,00,000", "connections": 6},
    {"id": "A018", "name": "Sanjay Kumar", "type": "Savings", "risk": "clean", "risk_score": 14, "declared_income": "₹6,50,000", "inflow_30d": "₹3,00,000", "outflow_30d": "₹2,70,000", "connections": 3},
]

transactions_data = [
    {"source_id": "A001", "target_id": "A002", "amount": 495000, "channel": "NEFT", "txn_time": "09:15"},
    {"source_id": "A002", "target_id": "A003", "amount": 490000, "channel": "RTGS", "txn_time": "10:42"},
    {"source_id": "A003", "target_id": "A004", "amount": 485000, "channel": "NEFT", "txn_time": "14:08"},
    {"source_id": "A004", "target_id": "A001", "amount": 480000, "channel": "UPI", "txn_time": "17:55"},
    {"source_id": "A005", "target_id": "A006", "amount": 75000, "channel": "UPI", "txn_time": "11:20"},
    {"source_id": "A007", "target_id": "A010", "amount": 350000, "channel": "RTGS", "txn_time": "08:30"},
    {"source_id": "A010", "target_id": "A012", "amount": 340000, "channel": "NEFT", "txn_time": "09:45"},
    {"source_id": "A012", "target_id": "A016", "amount": 335000, "channel": "RTGS", "txn_time": "11:00"},
    {"source_id": "A016", "target_id": "A007", "amount": 330000, "channel": "UPI", "txn_time": "13:30"},
    {"source_id": "A001", "target_id": "A007", "amount": 180000, "channel": "NEFT", "txn_time": "15:00"},
    {"source_id": "A005", "target_id": "A009", "amount": 55000, "channel": "UPI", "txn_time": "12:15"},
    {"source_id": "A009", "target_id": "A011", "amount": 42000, "channel": "UPI", "txn_time": "14:30"},
    {"source_id": "A013", "target_id": "A015", "amount": 280000, "channel": "RTGS", "txn_time": "10:00"},
    {"source_id": "A015", "target_id": "A017", "amount": 250000, "channel": "NEFT", "txn_time": "11:45"},
    {"source_id": "A017", "target_id": "A018", "amount": 95000, "channel": "UPI", "txn_time": "16:20"},
    {"source_id": "A006", "target_id": "A013", "amount": 62000, "channel": "UPI", "txn_time": "09:00"},
    {"source_id": "A016", "target_id": "A002", "amount": 890000, "channel": "RTGS", "txn_time": "07:30"},
    {"source_id": "A012", "target_id": "A001", "amount": 420000, "channel": "NEFT", "txn_time": "16:45"},
    {"source_id": "A010", "target_id": "A017", "amount": 180000, "channel": "NEFT", "txn_time": "13:00"},
    {"source_id": "A003", "target_id": "A008", "amount": 45000, "channel": "UPI", "txn_time": "15:30"},
]

alerts_data = [
    {"account_id": "A001", "name": "Rajesh Mehta Enterprises", "desc": "Round-trip pattern detected · 4 accounts · 3 hops", "amount": "₹18,45,000", "risk_level": "critical", "amount_class": "outflow"},
    {"account_id": "A016", "name": "Mule Account X1", "desc": "Volume anomaly · 45L through student account", "amount": "₹45,00,000", "risk_level": "critical", "amount_class": "outflow"},
    {"account_id": "A002", "name": "Shell Corp A", "desc": "No business purpose declared · rapid layering", "amount": "₹12,30,000", "risk_level": "critical", "amount_class": "outflow"},
    {"account_id": "A012", "name": "Shell Corp B", "desc": "Circular fund flow to mule network", "amount": "₹8,90,000", "risk_level": "critical", "amount_class": "outflow"},
    {"account_id": "A007", "name": "Kumar Trading Co.", "desc": "Unusually high velocity · 32 txns in 2 hours", "amount": "₹14,50,000", "risk_level": "high", "amount_class": "outflow"},
]

async def seed_db():
    print("Connecting to DB and dropping old tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        
    print("Tables created. Seeding data...")
    async with AsyncSessionLocal() as session:
        for acc in accounts_data:
            session.add(Account(**acc))
            
        for txn in transactions_data:
            txn["txn_date"] = "2026-03-14"
            session.add(Transaction(**txn))
            
        for alt in alerts_data:
            session.add(Alert(**alt))
            
        await session.commit()
    print("Database seeding completed.")

if __name__ == "__main__":
    asyncio.run(seed_db())
