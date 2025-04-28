from flask import Blueprint, request, jsonify
from ..factories.llm_factory import LLMFactory
from ..services.llm_service import LLMService

# Create a Blueprint for LLM routes
llm_bp = Blueprint('llm', __name__)

# Global LLM service (can be initialized in the main app)
llm_service = None

def init_llm_service(service: LLMService):
    """Initialize the global LLM service"""
    global llm_service
    llm_service = service

@llm_bp.route('/generate', methods=['POST'])
def generate():
    """Generate text from prompt"""
    if not llm_service:
        return jsonify({"error": "LLM service not initialized"}), 500
    
    data = request.json
    
    if not data or 'prompt' not in data:
        return jsonify({"error": "Prompt is required"}), 400
        
    prompt = data['prompt']
    template = data.get('template')
    
    try:
        response = llm_service.generate_response(prompt, template)
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@llm_bp.route('/update_llm', methods=['POST'])
def update_llm():
    """Update the LLM instance"""
    if not llm_service:
        return jsonify({"error": "LLM service not initialized"}), 500
    
    data = request.json
    
    if not data or 'llm_type' not in data:
        return jsonify({"error": "LLM type is required"}), 400
        
    llm_type = data['llm_type']
    kwargs = data.get('kwargs', {})
    
    try:
        new_llm = LLMFactory.create_llm(llm_type, **kwargs)
        llm_service.update_llm(new_llm)
        return jsonify({"message": f"LLM updated to {llm_type}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500 