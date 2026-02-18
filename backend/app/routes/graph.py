from fastapi import APIRouter
from app.graph.graph_client import get_session

router = APIRouter(prefix="/graph", tags=["Graph"])


@router.get("/{entity_name}")
def get_graph(entity_name: str):
    with get_session() as session:
        result = session.run(
            """
            MATCH path = (n {name: $name})-[*1..2]-(m)
            RETURN path
            """,
            name=entity_name
        )

        nodes = {}
        links = []

        for record in result:
            path = record["path"]

            if not path:
                continue

            # Add all nodes in path
            for node in path.nodes:
                node_name = node.get("name") or node.get("canonical_name")
                if not node_name:
                    continue

                nodes[node_name] = {
                    "id": node_name,
                    "label": list(node.labels)[0] if node.labels else "Unknown"
                }

            # Add all relationships in path
            for rel in path.relationships:
                start_node = rel.start_node
                end_node = rel.end_node

                start_name = start_node.get("name") or start_node.get("canonical_name")
                end_name = end_node.get("name") or end_node.get("canonical_name")

                if not start_name or not end_name:
                    continue

                links.append({
                    "source": start_name,
                    "target": end_name,
                    "type": rel.type
                })

        return {
            "nodes": list(nodes.values()),
            "links": links
        }
