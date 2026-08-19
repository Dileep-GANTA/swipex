import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import sys

def setup_postgresql():
    print("=" * 70)
    print("CONNECTING TO POSTGRESQL (PGADMIN) LOCALHOST WITH PASSWORD 'vikkihema'...")
    print("=" * 70)

    DB_NAME = "swipex"
    DB_USER = "postgres"
    DB_PASSWORD = "vikkihema"
    DB_HOST = "localhost"
    DB_PORT = "5432"

    try:
        # Step 1: Connect to default postgres database to drop/create swipex database
        conn = psycopg2.connect(
            dbname="postgres",
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        print(f"1. Dropping existing '{DB_NAME}' database if present...")
        cursor.execute(f"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '{DB_NAME}';")
        cursor.execute(f"DROP DATABASE IF EXISTS {DB_NAME};")
        
        print(f"2. Creating fresh PostgreSQL database '{DB_NAME}' in pgAdmin...")
        cursor.execute(f"CREATE DATABASE {DB_NAME};")
        print(f"[SUCCESS] Database '{DB_NAME}' created successfully in pgAdmin!")
        
        cursor.close()
        conn.close()
        return True

    except Exception as err:
        print(f"[ERROR] Could not connect to PostgreSQL on localhost:5432: {err}")
        return False

if __name__ == "__main__":
    success = setup_postgresql()
    sys.exit(0 if success else 1)
