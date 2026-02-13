from sqlalchemy.orm import Session
from app.services.sanctions_service import check_sanctions
from app.services.section889_service import evaluate_section_889


def run_assessment(supplier_id: int, db: Session):

    sanctions_result = check_sanctions(supplier_id, db)
    section889_result = evaluate_section_889(supplier_id, db)

    risk_score = 0
    reasons = []

    # Sanctions logic
    if sanctions_result.get("overall_status") == "FAIL":
        risk_score += 70
        reasons.append("Supplier matched sanctions list")

    # Section 889 logic
    if section889_result.get("section_889_status") == "FAIL":
        risk_score += 30
        reasons.append(section889_result.get("reason"))

    elif section889_result.get("section_889_status") == "CONDITIONAL":
        risk_score += 15
        reasons.append(section889_result.get("reason"))

    # Determine final status
    if risk_score >= 70:
        overall_status = "FAIL"
    elif risk_score >= 30:
        overall_status = "CONDITIONAL"
    else:
        overall_status = "PASS"

    # Backend-driven graph structure
    graph = {
        "nodes": [
            {"id": sanctions_result.get("supplier"), "risk": overall_status},
            {"id": "Sanctions", "risk": sanctions_result.get("overall_status")},
            {"id": "Section 889", "risk": section889_result.get("section_889_status")},
        ],
        "links": [
            {"source": sanctions_result.get("supplier"), "target": "Sanctions"},
            {"source": sanctions_result.get("supplier"), "target": "Section 889"},
        ]
    }

    return {
        "supplier": sanctions_result.get("supplier"),
        "overall_status": overall_status,
        "risk_score": risk_score,
        "sanctions": sanctions_result,
        "section_889": section889_result,
        "explanations": reasons,
        "graph": graph
    }
