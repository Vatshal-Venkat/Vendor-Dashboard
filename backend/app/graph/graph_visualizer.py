from app.graph.graph_client import get_session

def get_graph_data(entity_name: str, depth: int = 2):
    with get_session() as session:
        result = session.run(
            f"""
            MATCH path = (e:Entity {{name: $name}})-[r*1..{depth}]-(connected)
            RETURN path
            """,
            name=entity_name
        )

        nodes = {}
        edges = []

        for record in result:
            path = record["path"]

            for node in path.nodes:
                nodes[node.id] = {
                    "id": node.id,
                    "name": node.get("name"),
                    "type": node.get("type"),
                }

            for rel in path.relationships:
                edges.append({
                    "source": rel.start_node.id,
                    "target": rel.end_node.id,
                    "type": rel.get("type"),
                    "confidence": rel.get("confidence"),
                })

        return {
            "nodes": list(nodes.values()),
            "edges": edges
        }
