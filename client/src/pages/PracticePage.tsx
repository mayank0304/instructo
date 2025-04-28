import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PracticePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get state from location or set default values
    const state = location.state || {};
    const language = state.language || 'javascript';
    const title = state.title || 'Coding Practice';
    const objective = state.objective || 'Practice Session';
    const description = state.description || 'Open coding practice session.';
    
    // Enhanced description for practice session
    const practiceDescription = `${description}\n\nThis is a free practice session. You can code anything related to the objective above.`;
    
    // Redirect to code page with appropriate state
    navigate('/code', {
      state: {
        language,
        objective: `Practice: ${title} - ${objective}`,
        description: practiceDescription,
        challengeType: 'practice'
      }
    });
  }, [location.state, navigate]);
  
  return (
    <div className="font-sans bg-[#121228] text-white min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl mb-4">Redirecting to Practice Session...</h1>
        <div className="animate-spin w-8 h-8 border-4 border-[#fd8f58] border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  );
};

export default PracticePage; 