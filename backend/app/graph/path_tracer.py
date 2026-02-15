from app.graph.graph_client import get_session

def trace_risk_paths(entity_name: str):
    with get_session() as session:
        result = session.run(
            """
            MATCH path = (e:Entity {name: $name})-[:RELATION*1..3]->(r)
            RETURN path
            """,
            name=entity_name
        )

        return [record["path"] for record in result]
