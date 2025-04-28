from flask import Blueprint, request, jsonify
from ..services.quiz_service import QuizService
from ..factories.llm_factory import LLMFactory

# Create a Blueprint for quiz routes
quiz_bp = Blueprint('quiz', __name__)

# Global Quiz service 
quiz_service = None

def init_quiz_service(llm_service):
    """Initialize the global Quiz service"""
    global quiz_service
    quiz_service = QuizService(llm_service)

@quiz_bp.route('/generate', methods=['GET'])
def generate_quiz():
    """Generate a quiz for a specific programming language"""
    # Get language from query parameter
    language = request.args.get('language')
    
    if not language:
        return jsonify({"error": "Language parameter is required"}), 400
    
    try:
        # Generate quiz based on language
        quiz = quiz_service.generate_language_quiz(language)
        return jsonify(quiz)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@quiz_bp.route('/evaluate', methods=['POST'])
def evaluate_quiz():
    """Evaluate user's quiz responses"""
    data = request.json
    
    if not data or 'language' not in data or 'responses' not in data:
        return jsonify({"error": "Language and responses are required"}), 400
    
    try:
        # Evaluate quiz responses
        evaluation = quiz_service.evaluate_quiz(
            data['language'], 
            data['responses']
        )
        return jsonify(evaluation)
    except Exception as e:
        return jsonify({"error": str(e)}), 500 