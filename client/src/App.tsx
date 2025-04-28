import "./App.css";
import LanguageSelector from "./pages/LanguageSelector.tsx";
import ChatBot from "./ChatBot.tsx";
import RoadmapPage from "./pages/Roadmap.tsx";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sign from "./pages/Sign.tsx";
import Home from "./Home.tsx";
import Dashboard from "./Dashboard.tsx";
import { QuizPage } from "./pages/quiz.tsx";
import CodePage from "./pages/Code.tsx";
import CompletePage from "./pages/CompletePage.tsx";
import OutputPage from "./pages/OutputPage.tsx";
import ProblemPage from "./pages/ProblemPage.tsx";
import PracticePage from "./pages/PracticePage.tsx";
import PrivateRoute from "./components/PrivateRoute.tsx";

// Supported languages and levels
const languages = ["c", "cpp", "java", "javascript", "python"];
const levels = ["beginner", "intermediate", "advanced"];

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign" element={<Sign />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/languages" element={
          <PrivateRoute>
            <LanguageSelector />
          </PrivateRoute>
        } />
        <Route
          path="/chatbot"
          element={
            <PrivateRoute>
              <ChatBot selectedLanguage="javascript" />
            </PrivateRoute>
          }
        />
        
        {/* Generic roadmap route */}
        <Route path="/roadmap/:language/:level" element={
          <PrivateRoute>
            <RoadmapPage />
          </PrivateRoute>
        } />
        
        {/* Challenge type routes */}
        <Route path="/complete" element={
          <PrivateRoute>
            <CompletePage />
          </PrivateRoute>
        } />
        <Route path="/output" element={
          <PrivateRoute>
            <OutputPage />
          </PrivateRoute>
        } />
        <Route path="/problem" element={
          <PrivateRoute>
            <ProblemPage />
          </PrivateRoute>
        } />
        <Route path="/practice" element={
          <PrivateRoute>
            <PracticePage />
          </PrivateRoute>
        } />
        
        <Route path="/quiz/:language" element={
          <PrivateRoute>
            <QuizPage />
          </PrivateRoute>
        } />
        <Route path="/code" element={
          <PrivateRoute>
            <CodePage />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;
