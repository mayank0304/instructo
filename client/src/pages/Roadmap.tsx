import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Roadmap from '../components/Roadmap';

interface ParticleProps {
  x: number;
  y: number;
  size: number;
  speed: number;
  direction: number;
  color: string;
  alpha: number;
  pulse: number;
  pulseFactor: number;
}

interface RoadmapStep {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  icon: string;
}

interface RoadmapProps {
  selectedLanguage: string;
  steps?: RoadmapStep[];
  onStepClick?: (stepId: number) => void;
}

// Define roadmap data for each language and level
const roadmapData = {
  c: {
    beginner: {
      title: "C Programming for Beginners",
      description: "Start your journey with C, the foundational language of modern computing."
    },
    intermediate: {
      title: "Intermediate C Programming",
      description: "Deepen your understanding of C with more complex concepts and applications."
    },
    advanced: {
      title: "Advanced C Programming",
      description: "Master the intricacies of C and develop professional-grade applications."
    }
  },
  cpp: {
    beginner: {
      title: "C++ Programming for Beginners",
      description: "Learn the basics of C++ and object-oriented programming."
    },
    intermediate: {
      title: "Intermediate C++ Programming",
      description: "Explore more advanced features of C++ and modern C++ standards."
    },
    advanced: {
      title: "Advanced C++ Programming",
      description: "Dive into template metaprogramming, memory management, and optimization."
    }
  },
  java: {
    beginner: {
      title: "Java Programming for Beginners",
      description: "Start your Java journey with core concepts and syntax."
    },
    intermediate: {
      title: "Intermediate Java Programming",
      description: "Learn about collections, generics, and file handling in Java."
    },
    advanced: {
      title: "Advanced Java Programming",
      description: "Master multithreading, networking, and design patterns in Java."
    }
  },
  javascript: {
    beginner: {
      title: "JavaScript Programming for Beginners",
      description: "Learn the basics of JavaScript and web development."
    },
    intermediate: {
      title: "Intermediate JavaScript Programming",
      description: "Explore DOM manipulation, asynchronous programming, and ES6+ features."
    },
    advanced: {
      title: "Advanced JavaScript Programming",
      description: "Master closures, prototypes, and advanced frameworks."
    }
  },
  python: {
    beginner: {
      title: "Python Programming for Beginners",
      description: "Start your Python journey with basic syntax and concepts."
    },
    intermediate: {
      title: "Intermediate Python Programming",
      description: "Learn about modules, packages, and object-oriented programming in Python."
    },
    advanced: {
      title: "Advanced Python Programming",
      description: "Master decorators, generators, and advanced libraries in Python."
    }
  }
};
  
// Define custom steps for each language and level
// This is where you would define the specific steps for each language and level
// For now, we'll use a simple function to generate some example steps
const generateSteps = (language: string, level: string) => {
  const baseSteps = [
    {
      id: 1,
      title: 'Variables & Data Types',
      description: `Learn how to declare variables and understand different data types in ${language}.`,
      status: 'completed' as const,
      icon: '🚀',
      objective: 'Foundation of Programming'
    },
    {
      id: 2,
      title: 'Control Structures',
      description: `Master if/else statements, loops, and control flow patterns in ${language}.`,
      status: 'current' as const,
      icon: '🔄',
      objective: 'Program Flow Control'
    },
    {
      id: 3,
      title: 'Functions & Methods',
      description: `Learn how to create reusable code through functions in ${language}.`,
      status: 'upcoming' as const,
      icon: '📦',
      objective: 'Code Reusability'
    }
  ];
  
  // Add more steps based on level
  if (level === 'intermediate' || level === 'advanced') {
    baseSteps.push({
      id: 4,
      title: 'Data Structures',
      description: `Understand arrays, collections, and data organization in ${language}.`,
      status: 'upcoming' as const,
      icon: '🏗️',
      objective: 'Data Organization'
    });
    
    baseSteps.push({
      id: 5,
      title: 'Object-Oriented Programming',
      description: `Learn to design programs using classes and objects in ${language}.`,
      status: 'upcoming' as const,
      icon: '🧠',
      objective: 'OOP Concepts'
    });
  }
  
  if (level === 'advanced') {
    baseSteps.push({
      id: 6,
      title: 'Advanced Concepts',
      description: `Dive into advanced topics like memory management and optimization in ${language}.`,
      status: 'upcoming' as const,
      icon: '🛠️',
      objective: 'Professional Development'
    });
  }
  
  return baseSteps;
};

// Define language-specific customizations
const languageCustomizations = {
  c: {
    beginner: {
      // C-specific beginner customizations
    },
    intermediate: {
      // C-specific intermediate customizations
    },
    advanced: {
      // C-specific advanced customizations
    }
  },
  // ... similar structures for other languages
};

const RoadmapPage: React.FC = () => {
  const { language = 'javascript', level = 'beginner' } = useParams<{ language: string; level: string }>();
  const navigate = useNavigate();
  
  // Validate language and level
  const validLanguage = ['c', 'cpp', 'java', 'javascript', 'python'].includes(language) ? language : 'javascript';
  const validLevel = ['beginner', 'intermediate', 'advanced'].includes(level) ? level : 'beginner';
        
  // Get title and description for the roadmap
  const roadmapInfo = roadmapData[validLanguage as keyof typeof roadmapData]?.[validLevel as keyof typeof roadmapData.c] || {
    title: `${validLanguage.toUpperCase()} Programming`,
    description: `Learn ${validLanguage} programming from scratch.`
  };
  
  // Generate steps for the roadmap
  const steps = generateSteps(validLanguage, validLevel);
  
  // Handle step click
  const handleStepClick = (stepId: number) => {
    console.log(`Clicked on step ${stepId}`);
  };

  return (
    <Roadmap 
      selectedLanguage={validLanguage}
      steps={steps}
      onStepClick={handleStepClick}
    />
  );
};

export default RoadmapPage; 