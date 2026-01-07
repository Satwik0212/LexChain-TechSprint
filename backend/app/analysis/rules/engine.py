from typing import List
from app.analysis.schemas import Clause
from app.analysis.rules.models import RuleEngineResult, LayerResult, RiskLevel
from app.analysis.rules.scoring import aggregate_results

# Explicit imports ensure strict dependency tracking
# If a layer file is missing, the application will fail to start (Fast Fail)
from app.analysis.rules.layer1_structural import run_layer1
from app.analysis.rules.layer2_termination import run_layer2
from app.analysis.rules.layer3_liability import run_layer3
from app.analysis.rules.layer4_employment import run_layer4
from app.analysis.rules.layer5_ip_confidential import run_layer5
from app.analysis.rules.layer6_dispute import run_layer6
from app.analysis.rules.layer7_fairness import run_layer7

def run_risk_engine(clauses: List[Clause]) -> RuleEngineResult:
    """
    Orchestrates the rule-based risk analysis pipeline.
    Executes all 7 layers sequentially and aggregates results.
    
    Args:
        clauses: List of Clause objects from the segmentation phase.
        
    Returns:
        RuleEngineResult: Aggregated risk score and detailed flags.
    """
    layer_results: List[LayerResult] = []

    # --- EXECUTION PHASE ---
    # Strictly sequential execution of all layers
    # Each layer function MUST return a LayerResult object
    
    layer_results.append(run_layer1(clauses))
    layer_results.append(run_layer2(clauses))
    layer_results.append(run_layer3(clauses))
    layer_results.append(run_layer4(clauses))
    layer_results.append(run_layer5(clauses))
    layer_results.append(run_layer6(clauses))
    layer_results.append(run_layer7(clauses))

    # --- AGGREGATION PHASE ---
    overall_risk, score, recommendation = aggregate_results(layer_results)

    return RuleEngineResult(
        layer_results=layer_results,
        overall_risk=overall_risk,
        score=score,
        recommendation=recommendation
    )
