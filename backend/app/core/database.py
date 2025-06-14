from neo4j import AsyncGraphDatabase
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class Neo4jConnection:
    def __init__(self):
        self.driver = None
    
    async def connect(self):
        try:
            self.driver = AsyncGraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
            )
            # Test connection
            async with self.driver.session() as session:
                await session.run("RETURN 1")
            logger.info("Connected to Neo4j database")
        except Exception as e:
            logger.error(f"Failed to connect to Neo4j: {e}")
            raise
    
    async def close(self):
        if self.driver:
            await self.driver.close()
    
    def get_session(self):
        return self.driver.session()

# Global connection instance
neo4j_connection = Neo4jConnection()

async def get_db():
    """Dependency to get database session"""
    async with neo4j_connection.get_session() as session:
        yield session

async def init_db():
    """Initialize database with constraints and indexes"""
    await neo4j_connection.connect()
    
    async with neo4j_connection.get_session() as session:
        # Create constraints
        constraints = [
            "CREATE CONSTRAINT user_email IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE",
            "CREATE CONSTRAINT course_id IF NOT EXISTS FOR (c:Course) REQUIRE c.id IS UNIQUE",
            "CREATE CONSTRAINT document_id IF NOT EXISTS FOR (d:Document) REQUIRE d.id IS UNIQUE",
        ]
        
        for constraint in constraints:
            try:
                await session.run(constraint)
                logger.info(f"Created constraint: {constraint}")
            except Exception as e:
                logger.warning(f"Constraint already exists or failed: {e}")
        
        # Create indexes
        indexes = [
            "CREATE INDEX user_id IF NOT EXISTS FOR (u:User) ON (u.id)",
            "CREATE INDEX course_title IF NOT EXISTS FOR (c:Course) ON (c.title)",
            "CREATE INDEX document_title IF NOT EXISTS FOR (d:Document) ON (d.title)",
        ]
        
        for index in indexes:
            try:
                await session.run(index)
                logger.info(f"Created index: {index}")
            except Exception as e:
                logger.warning(f"Index already exists or failed: {e}")
