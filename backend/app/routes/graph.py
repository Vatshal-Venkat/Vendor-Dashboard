from fastapi import APIRouter
from app.graph.graph_visualizer import get_graph_data

router = APIRouter(prefix="/graph", tags=["Graph"])

@router.get("/{entity_name}")
def visualize_graph(entity_name: str, depth: int = 2):
    data = get_graph_data(entity_name, depth)
    return data
