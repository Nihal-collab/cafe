import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    db_name = "cafe_db"
    # Try common local development postgres credentials
    credentials_list = [
        {"user": "postgres", "password": "postgres", "host": "localhost", "port": 5432},
        {"user": "postgres", "password": "", "host": "localhost", "port": 5432},
        {"user": "postgres", "password": "root", "host": "localhost", "port": 5432},
        {"user": "postgres", "password": "password", "host": "localhost", "port": 5432},
        {"user": "postgres", "password": "admin", "host": "localhost", "port": 5432},
        {"user": "postgres", "password": "1234", "host": "localhost", "port": 5432},
        {"user": "postgres", "password": "123456", "host": "localhost", "port": 5432},
        {"user": "postgres", "password": "123", "host": "localhost", "port": 5432},
        {"user": "postgres", "password": "gniha", "host": "localhost", "port": 5432},
        {"user": "postgres", "password": "jarvis", "host": "localhost", "port": 5432},
        {"user": "postgres", "password": "brave", "host": "localhost", "port": 5432},
        {"user": "postgres", "password": "postgres123", "host": "localhost", "port": 5432},
        {"user": "postgres", "password": "postgres@123", "host": "localhost", "port": 5432},
    ]

    conn = None
    for creds in credentials_list:
        try:
            print(f"Trying to connect to PostgreSQL with user='{creds['user']}' and password='{creds['password']}'...")
            conn = psycopg2.connect(
                dbname="postgres",
                user=creds["user"],
                password=creds["password"],
                host=creds["host"],
                port=creds["port"]
            )
            print("Successfully connected!")
            break
        except Exception as e:
            print(f"Failed: {e}")

    if not conn:
        print("\nCould not connect to PostgreSQL. Please ensure PostgreSQL is running and your user has access.")
        return False

    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()

    try:
        # Check if database exists
        cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{db_name}'")
        exists = cursor.fetchone()
        if not exists:
            print(f"Database '{db_name}' does not exist. Creating...")
            cursor.execute(f"CREATE DATABASE {db_name}")
            print(f"Database '{db_name}' created successfully!")
        else:
            print(f"Database '{db_name}' already exists.")
        
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Error checking/creating database: {e}")
        if conn:
            conn.close()
        return False

if __name__ == "__main__":
    create_database()
