# ============================================================
# db/neo4j_client.py  —  Mock Neo4j Client
# ============================================================
import asyncio
from typing import List, Dict

async def predict_next_hops(account_id: str) -> List[Dict]:
    """ Mock prediction of next hops for GNN overlay. """
    await asyncio.sleep(0.5) # simulate latency
    
    # Return synthetic dummy next hops
    return [
        {"target_id": "A002", "confidence": 0.89},
        {"target_id": "A007", "confidence": 0.65},
    ]
