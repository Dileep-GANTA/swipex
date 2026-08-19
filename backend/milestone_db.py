from app.database import Base, engine
from app import models

def init_milestone1_database():
    print("🚀 Connecting to PostgreSQL and initializing Milestone 1 Core Database...")
    try:
        # SQLAlchemy ద్వారా 'users' మరియు 'user_sessions' టేబుల్స్ క్రియేట్ అవుతాయి
        Base.metadata.create_all(bind=engine)
        print("✅ Milestone 1 Database Setup Success! Tables are ready in swipex_db.")
    except Exception as e:
        print(f"❌ Database Creation Error: {e}")
        print("💡 Hint: app/database.py లో యూజర్‌నేమ్, పాస్‌వర్డ్ కరెక్ట్‌గా ఉన్నాయో లేదో చూడు master.")

if __name__ == "__main__":
    init_milestone1_database()

