from app.graph.graph_client import get_session

def propagate_risk(entity_name: str) -> float:
    with get_session() as session:
        result = session.run(
            """
            MATCH (e:Entity {name: $name})-[:RELATION*1..3]->(r)
            RETURN count(r) as connections
            """,
            name=entity_name
        )

        record = result.single()
        connections = record["connections"] if record else 0

        return min(connections * 10, 50)
