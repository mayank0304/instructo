# app.py
from flask import Flask
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Import local modules
from src.factories.llm_factory import LLMFactory
from src.services.llm_service import LLMService
from src.routes.llm_routes import llm_bp, init_llm_service
from src.routes.quiz_routes import quiz_bp, init_quiz_service
from src.routes.code_review_routes import code_review_bp, init_code_review_service
from src.routes.coding_challenge_routes import coding_challenge_bp, init_coding_challenge_service

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Register blueprints
    app.register_blueprint(llm_bp)
    app.register_blueprint(quiz_bp, url_prefix='/quiz')
    app.register_blueprint(code_review_bp, url_prefix='/code')
    app.register_blueprint(coding_challenge_bp, url_prefix='/challenge')
    
    return app

def initialize_services():
    """Initialize all services"""
    try:
        # Create default LLM using Gemini
        default_llm = LLMFactory.create_llm()
        llm_service = LLMService(default_llm)
        
        # Initialize the global services
        init_llm_service(llm_service)
        init_quiz_service(llm_service)
        init_code_review_service(llm_service)
        init_coding_challenge_service(llm_service)
        
        return llm_service
    except Exception as e:
        print(f"Error initializing services: {e}")
        return None

def main():
    """Main application entry point"""
    # Create the Flask app
    app = create_app()
    
    # Initialize services
    initialize_services()
    
    # Run the application
    app.run(
        host=os.getenv('HOST', '0.0.0.0'), 
        port=int(os.getenv('PORT', 5000)), 
        debug=os.getenv('DEBUG', 'True').lower() == 'true'
    )

if __name__ == '__main__':
    main()