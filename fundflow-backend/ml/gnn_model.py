# ============================================================
# ml/gnn_model.py  —  Mock GNN Model
# ============================================================

# Mock global findings for GNN overlay
GNN_FINDINGS = {
    "confidence": 94,
    "pattern": "Round-Trip",
    "model": "PyTorch Geometric"
}

def get_shap_explanation(account_id: str) -> dict:
    """ Mock SHAP feature importance for risk score. """
    return {
        "account_id": account_id,
        "features": {
            "transaction_velocity": 0.45,
            "structuring_risk": 0.30,
            "profile_mismatch": 0.15,
            "dormant_activity": 0.10
        }
    }
