const mongoose = require('mongoose');
const User = require('./models/User');
const Internship = require('./models/Internship');
require('dotenv').config();

// PRODUCTION MODE: Demo data seeding is disabled
// To enable demo data for development, set ENABLE_DEMO_DATA=true in .env
const DEMO_DATA_ENABLED = process.env.ENABLE_DEMO_DATA === 'true';

const sampleUsers = [
  {
    name: 'Tech Corp',
    email: 'hr@techcorp.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'company',
    isVerified: true,
    companyProfile: {
      companyName: 'Tech Corp',
      industry: 'Technology',
      companySize: '100-500',
      website: 'https://techcorp.com',
      description: 'Leading technology company specializing in software development and AI solutions.'
    }
  },
  {
    name: 'InnovateLabs',
    email: 'careers@innovatelabs.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'company',
    isVerified: true,
    companyProfile: {
      companyName: 'InnovateLabs',
      industry: 'Artificial Intelligence',
      companySize: '50-100',
      website: 'https://innovatelabs.ai',
      description: 'Cutting-edge AI research company developing next-generation machine learning solutions.'
    }
  },
  {
    name: 'DataFlow Systems',
    email: 'jobs@dataflow.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'company',
    isVerified: true,
    companyProfile: {
      companyName: 'DataFlow Systems',
      industry: 'Data Analytics',
      companySize: '200-500',
      website: 'https://dataflow.com',
      description: 'Enterprise data analytics platform helping businesses make data-driven decisions.'
    }
  },
  {
    name: 'CloudNine Solutions',
    email: 'talent@cloudnine.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'company',
    isVerified: true,
    companyProfile: {
      companyName: 'CloudNine Solutions',
      industry: 'Cloud Computing',
      companySize: '500-1000',
      website: 'https://cloudnine.com',
      description: 'Leading cloud infrastructure provider with global presence and innovative solutions.'
    }
  },
  {
    name: 'FinTech Dynamics',
    email: 'hr@fintechdynamics.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'company',
    isVerified: true,
    companyProfile: {
      companyName: 'FinTech Dynamics',
      industry: 'Financial Technology',
      companySize: '100-200',
      website: 'https://fintechdynamics.com',
      description: 'Revolutionary fintech company transforming digital payments and banking solutions.'
    }
  },
  {
    name: 'GreenTech Innovations',
    email: 'careers@greentech.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'company',
    isVerified: true,
    companyProfile: {
      companyName: 'GreenTech Innovations',
      industry: 'Renewable Energy',
      companySize: '50-100',
      website: 'https://greentech.com',
      description: 'Sustainable technology company focused on renewable energy and environmental solutions.'
    }
  },
  {
    name: 'CyberShield Security',
    email: 'jobs@cybershield.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'company',
    isVerified: true,
    companyProfile: {
      companyName: 'CyberShield Security',
      industry: 'Cybersecurity',
      companySize: '100-200',
      website: 'https://cybershield.com',
      description: 'Advanced cybersecurity firm protecting enterprises from digital threats and vulnerabilities.'
    }
  },
  {
    name: 'HealthTech Pro',
    email: 'talent@healthtechpro.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'company',
    isVerified: true,
    companyProfile: {
      companyName: 'HealthTech Pro',
      industry: 'Healthcare Technology',
      companySize: '200-300',
      website: 'https://healthtechpro.com',
      description: 'Healthcare technology company developing innovative medical software and devices.'
    }
  },
  {
    name: 'EduPlatform Inc',
    email: 'hr@eduplatform.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'company',
    isVerified: true,
    companyProfile: {
      companyName: 'EduPlatform Inc',
      industry: 'Education Technology',
      companySize: '100-150',
      website: 'https://eduplatform.com',
      description: 'Educational technology platform revolutionizing online learning and student engagement.'
    }
  },
  {
    name: 'GameStudio Alpha',
    email: 'careers@gamestudio.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'company',
    isVerified: true,
    companyProfile: {
      companyName: 'GameStudio Alpha',
      industry: 'Gaming',
      companySize: '50-100',
      website: 'https://gamestudio.com',
      description: 'Independent game development studio creating immersive gaming experiences.'
    }
  },
  {
    name: 'RoboTech Industries',
    email: 'jobs@robotech.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'company',
    isVerified: true,
    companyProfile: {
      companyName: 'RoboTech Industries',
      industry: 'Robotics',
      companySize: '300-500',
      website: 'https://robotech.com',
      description: 'Advanced robotics company developing autonomous systems for industrial applications.'
    }
  },
  {
    name: 'SocialConnect',
    email: 'talent@socialconnect.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'company',
    isVerified: true,
    companyProfile: {
      companyName: 'SocialConnect',
      industry: 'Social Media',
      companySize: '500-1000',
      website: 'https://socialconnect.com',
      description: 'Next-generation social media platform focusing on authentic connections and privacy.'
    }
  },
  {
    name: 'EcoSmart Solutions',
    email: 'hr@ecosmart.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'company',
    isVerified: true,
    companyProfile: {
      companyName: 'EcoSmart Solutions',
      industry: 'Environmental Technology',
      companySize: '100-200',
      website: 'https://ecosmart.com',
      description: 'Environmental technology company developing smart solutions for sustainable living.'
    }
  },
  {
    name: 'VirtualReality Labs',
    email: 'careers@vrlabs.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'company',
    isVerified: true,
    companyProfile: {
      companyName: 'VirtualReality Labs',
      industry: 'Virtual Reality',
      companySize: '50-100',
      website: 'https://vrlabs.com',
      description: 'VR/AR technology company creating immersive experiences for entertainment and training.'
    }
  },
  {
    name: 'BlockChain Ventures',
    email: 'jobs@blockchainventures.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'company',
    isVerified: true,
    companyProfile: {
      companyName: 'BlockChain Ventures',
      industry: 'Blockchain',
      companySize: '100-150',
      website: 'https://blockchainventures.com',
      description: 'Blockchain technology company developing decentralized applications and crypto solutions.'
    }
  },
  {
    name: 'AutoDrive Systems',
    email: 'talent@autodrive.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'company',
    isVerified: true,
    companyProfile: {
      companyName: 'AutoDrive Systems',
      industry: 'Autonomous Vehicles',
      companySize: '200-400',
      website: 'https://autodrive.com',
      description: 'Autonomous vehicle technology company developing self-driving car systems.'
    }
  },
  {
    name: 'SpaceTech Dynamics',
    email: 'hr@spacetech.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'company',
    isVerified: true,
    companyProfile: {
      companyName: 'SpaceTech Dynamics',
      industry: 'Aerospace',
      companySize: '500-1000',
      website: 'https://spacetech.com',
      description: 'Aerospace technology company developing satellite systems and space exploration tools.'
    }
  },
  {
    name: 'BioTech Innovations',
    email: 'careers@biotechinnovations.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'company',
    isVerified: true,
    companyProfile: {
      companyName: 'BioTech Innovations',
      industry: 'Biotechnology',
      companySize: '100-200',
      website: 'https://biotechinnovations.com',
      description: 'Biotechnology company researching genetic engineering and pharmaceutical solutions.'
    }
  },
  {
    name: 'SmartHome Tech',
    email: 'jobs@smarthometech.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'company',
    isVerified: true,
    companyProfile: {
      companyName: 'SmartHome Tech',
      industry: 'IoT',
      companySize: '150-250',
      website: 'https://smarthometech.com',
      description: 'IoT company developing smart home automation systems and connected devices.'
    }
  },
  {
    name: 'QuantumCompute Labs',
    email: 'talent@quantumcompute.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'company',
    isVerified: true,
    companyProfile: {
      companyName: 'QuantumCompute Labs',
      industry: 'Quantum Computing',
      companySize: '50-100',
      website: 'https://quantumcompute.com',
      description: 'Quantum computing research company developing next-generation computing systems.'
    }
  },
  // Students
  {
    name: 'John Student',
    email: 'john@student.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'student',
    isVerified: true,
    studentProfile: {
      university: 'MIT',
      degree: 'Computer Science',
      graduationYear: 2025,
      skills: ['JavaScript', 'React', 'Node.js', 'Python'],
      bio: 'Passionate computer science student with experience in full-stack development.'
    }
  }
];

const sampleInternships = [
  {
    title: 'Full Stack Developer Intern',
    company: null, // Will be set after creating company
    companyName: 'Tech Corp',
    description: 'Join our development team to build cutting-edge web applications using React, Node.js, and MongoDB.',
    requirements: {
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Git'],
      experience: 'Entry level',
      education: 'Currently pursuing Computer Science or related degree'
    },
    responsibilities: [
      'Develop web applications using React and Node.js',
      'Work with MongoDB databases',
      'Collaborate with senior developers',
      'Participate in code reviews'
    ],
    location: {
      type: 'onsite',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA'
    },
    type: 'internship',
    duration: '3 months',
    stipend: {
      amount: 2500,
      currency: 'USD',
      period: 'monthly'
    },
    category: 'Software Development',
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    endDate: new Date(Date.now() + 135 * 24 * 60 * 60 * 1000), // 135 days from now (3 months)
    status: 'active'
  },
  {
    title: 'Frontend Developer Intern',
    company: null,
    companyName: 'Tech Corp',
    description: 'Work on user interface development using modern frontend technologies and design systems.',
    requirements: {
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Figma'],
      experience: 'Entry level',
      education: 'Currently pursuing Computer Science or related degree'
    },
    responsibilities: [
      'Design and implement user interfaces',
      'Work with design systems',
      'Optimize frontend performance',
      'Ensure responsive design'
    ],
    location: {
      type: 'remote',
      city: 'New York',
      state: 'NY',
      country: 'USA'
    },
    type: 'internship',
    duration: '6 months',
    stipend: {
      amount: 1800,
      currency: 'USD',
      period: 'monthly'
    },
    category: 'Web Development',
    applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    endDate: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000), // 240 days from now (6 months)
    status: 'active'
  },
  {
    title: 'Data Science Intern',
    company: null,
    companyName: 'Tech Corp',
    description: 'Analyze large datasets and build machine learning models to drive business insights.',
    requirements: {
      skills: ['Python', 'Machine Learning', 'SQL', 'Pandas', 'Tableau'],
      experience: 'Entry level',
      education: 'Statistics, Data Science, or related field'
    },
    responsibilities: [
      'Analyze large datasets',
      'Build machine learning models',
      'Create data visualizations',
      'Present insights to stakeholders'
    ],
    location: {
      type: 'onsite',
      city: 'Austin',
      state: 'TX',
      country: 'USA'
    },
    type: 'internship',
    duration: '4 months',
    stipend: {
      amount: 3000,
      currency: 'USD',
      period: 'monthly'
    },
    category: 'Data Science',
    applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
    startDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
    endDate: new Date(Date.now() + 155 * 24 * 60 * 60 * 1000), // 155 days from now (4 months)
    status: 'active'
  },

  // InnovateLabs
  {
    title: "AI Research Intern",
    description: "Join our cutting-edge AI research team to work on machine learning algorithms and neural networks. You'll contribute to groundbreaking projects in computer vision and natural language processing.",
    companyName: "InnovateLabs",
    category: "Machine Learning",
    requirements: {
      skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning'],
      experience: 'Entry level',
      education: 'Computer Science, AI, or related field'
    },
    responsibilities: [
      'Implement machine learning algorithms',
      'Conduct research experiments',
      'Analyze model performance',
      'Write research papers'
    ],
    location: {
      type: 'hybrid',
      city: 'Boston',
      state: 'MA',
      country: 'USA'
    },
    type: 'internship',
    duration: '6 months',
    stipend: {
      amount: 3200,
      currency: 'USD',
      period: 'monthly'
    },
    category: 'Machine Learning',
    applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 220 * 24 * 60 * 60 * 1000),
    status: 'active'
  },

  // DataFlow Systems
  {
    title: 'Data Analytics Intern',
    company: null,
    companyName: 'DataFlow Systems',
    description: 'Help enterprise clients make data-driven decisions through advanced analytics and visualization.',
    requirements: {
      skills: ['SQL', 'Python', 'Tableau', 'Power BI', 'Statistics'],
      experience: 'Entry level',
      education: 'Data Science, Statistics, or Business Analytics'
    },
    responsibilities: [
      'Create data dashboards',
      'Perform statistical analysis',
      'Generate business insights',
      'Present findings to clients'
    ],
    location: {
      type: 'remote',
      city: 'Chicago',
      state: 'IL',
      country: 'USA'
    },
    type: 'internship',
    duration: '4 months',
    stipend: {
      amount: 2800,
      currency: 'USD',
      period: 'monthly'
    },
    category: 'Data Science',
    applicationDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 170 * 24 * 60 * 60 * 1000),
    status: 'active'
  },

  // CloudNine Solutions
  {
    title: 'Cloud Infrastructure Intern',
    company: null,
    companyName: 'CloudNine Solutions',
    description: 'Learn cloud architecture and help manage scalable infrastructure solutions.',
    requirements: {
      skills: ['AWS', 'Docker', 'Kubernetes', 'Linux', 'Terraform'],
      experience: 'Entry level',
      education: 'Computer Science or IT related field'
    },
    responsibilities: [
      'Deploy cloud applications',
      'Monitor system performance',
      'Automate infrastructure tasks',
      'Troubleshoot technical issues'
    ],
    location: {
      type: 'onsite',
      city: 'Seattle',
      state: 'WA',
      country: 'USA'
    },
    type: 'internship',
    duration: '5 months',
    stipend: {
      amount: 3000,
      currency: 'USD',
      period: 'monthly'
    },
    category: 'Software Development',
    applicationDeadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 205 * 24 * 60 * 60 * 1000),
    status: 'active'
  },

  // FinTech Dynamics
  {
    title: 'FinTech Developer Intern',
    company: null,
    companyName: 'FinTech Dynamics',
    description: 'Develop secure financial applications and payment processing systems.',
    requirements: {
      skills: ['Java', 'Spring Boot', 'REST APIs', 'Security', 'Blockchain'],
      experience: 'Entry level',
      education: 'Computer Science or Finance related field'
    },
    responsibilities: [
      'Build payment processing features',
      'Implement security protocols',
      'Test financial applications',
      'Work with compliance requirements'
    ],
    location: {
      type: 'hybrid',
      city: 'New York',
      state: 'NY',
      country: 'USA'
    },
    type: 'internship',
    duration: '4 months',
    stipend: {
      amount: 3500,
      currency: 'USD',
      period: 'monthly'
    },
    category: 'Finance',
    applicationDeadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 43 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 163 * 24 * 60 * 60 * 1000),
    status: 'active'
  },

  // GreenTech Innovations
  {
    title: 'Renewable Energy Software Intern',
    company: null,
    companyName: 'GreenTech Innovations',
    description: 'Develop software solutions for renewable energy management and optimization.',
    requirements: {
      skills: ['Python', 'IoT', 'Data Analysis', 'Embedded Systems', 'MATLAB'],
      experience: 'Entry level',
      education: 'Electrical Engineering or Environmental Science'
    },
    responsibilities: [
      'Develop energy monitoring systems',
      'Analyze renewable energy data',
      'Optimize energy efficiency',
      'Create sustainability reports'
    ],
    location: {
      type: 'onsite',
      city: 'Portland',
      state: 'OR',
      country: 'USA'
    },
    type: 'internship',
    duration: '6 months',
    stipend: {
      amount: 2600,
      currency: 'USD',
      period: 'monthly'
    },
    category: 'Software Development',
    applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000),
    status: 'active'
  },

  // CyberShield Security
  {
    title: 'Cybersecurity Analyst Intern',
    company: null,
    companyName: 'CyberShield Security',
    description: 'Learn threat detection and help protect enterprise systems from cyber attacks.',
    requirements: {
      skills: ['Network Security', 'Penetration Testing', 'Python', 'Linux', 'SIEM'],
      experience: 'Entry level',
      education: 'Cybersecurity or Computer Science'
    },
    responsibilities: [
      'Monitor security alerts',
      'Conduct vulnerability assessments',
      'Analyze threat intelligence',
      'Document security incidents'
    ],
    location: {
      type: 'onsite',
      city: 'Washington',
      state: 'DC',
      country: 'USA'
    },
    type: 'internship',
    duration: '4 months',
    stipend: {
      amount: 3100,
      currency: 'USD',
      period: 'monthly'
    },
    category: 'Software Development',
    applicationDeadline: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 47 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 167 * 24 * 60 * 60 * 1000),
    status: 'active'
  },

  // HealthTech Pro
  {
    title: 'Healthcare Software Developer Intern',
    company: null,
    companyName: 'HealthTech Pro',
    description: 'Develop medical software applications that improve patient care and healthcare efficiency.',
    requirements: {
      skills: ['C#', '.NET', 'SQL Server', 'HIPAA Compliance', 'Healthcare Standards'],
      experience: 'Entry level',
      education: 'Computer Science or Biomedical Engineering'
    },
    responsibilities: [
      'Build healthcare applications',
      'Ensure HIPAA compliance',
      'Integrate with medical devices',
      'Test software functionality'
    ],
    location: {
      type: 'hybrid',
      city: 'Atlanta',
      state: 'GA',
      country: 'USA'
    },
    type: 'internship',
    duration: '5 months',
    stipend: {
      amount: 2900,
      currency: 'USD',
      period: 'monthly'
    },
    category: 'Software Development',
    applicationDeadline: new Date(Date.now() + 38 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 203 * 24 * 60 * 60 * 1000),
    status: 'active'
  },

  // EduPlatform Inc
  {
    title: 'EdTech Product Development Intern',
    company: null,
    companyName: 'EduPlatform Inc',
    description: 'Help build innovative educational technology products that enhance learning experiences.',
    requirements: {
      skills: ['React', 'Node.js', 'MongoDB', 'UX Design', 'Educational Psychology'],
      experience: 'Entry level',
      education: 'Computer Science or Education Technology'
    },
    responsibilities: [
      'Develop learning management features',
      'Design user interfaces',
      'Conduct user research',
      'Implement gamification elements'
    ],
    location: {
      type: 'remote',
      city: 'Austin',
      state: 'TX',
      country: 'USA'
    },
    type: 'internship',
    duration: '4 months',
    stipend: {
      amount: 2400,
      currency: 'USD',
      period: 'monthly'
    },
    category: 'Software Development',
    applicationDeadline: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 57 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 177 * 24 * 60 * 60 * 1000),
    status: 'active'
  },

  // GameStudio Alpha
  {
    title: 'Game Developer Intern',
    company: null,
    companyName: 'GameStudio Alpha',
    description: 'Join our game development team to create engaging and immersive gaming experiences.',
    requirements: {
      skills: ['Unity', 'C#', 'Game Design', '3D Modeling', 'Animation'],
      experience: 'Entry level',
      education: 'Game Development or Computer Science'
    },
    responsibilities: [
      'Develop game mechanics',
      'Create game assets',
      'Implement user interfaces',
      'Test gameplay features'
    ],
    location: {
      type: 'onsite',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA'
    },
    type: 'internship',
    duration: '6 months',
    stipend: {
      amount: 2200,
      currency: 'USD',
      period: 'monthly'
    },
    category: 'Software Development',
    applicationDeadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 245 * 24 * 60 * 60 * 1000),
    status: 'active'
  },

  // RoboTech Industries
  {
    title: 'Robotics Engineering Intern',
    company: null,
    companyName: 'RoboTech Industries',
    description: 'Design and develop autonomous robotic systems for industrial applications.',
    requirements: {
      skills: ['Python', 'ROS', 'Computer Vision', 'Machine Learning', 'CAD'],
      experience: 'Entry level',
      education: 'Robotics, Mechanical, or Electrical Engineering'
    },
    responsibilities: [
      'Program robotic control systems',
      'Develop computer vision algorithms',
      'Test autonomous navigation',
      'Design mechanical components'
    ],
    location: {
      type: 'onsite',
      city: 'Detroit',
      state: 'MI',
      country: 'USA'
    },
    type: 'internship',
    duration: '5 months',
    stipend: {
      amount: 3200,
      currency: 'USD',
      period: 'monthly'
    },
    category: 'Software Development',
    applicationDeadline: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 48 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 198 * 24 * 60 * 60 * 1000),
    status: 'active'
  },

  // SocialConnect
  {
    title: 'Social Media Platform Developer Intern',
    company: null,
    companyName: 'SocialConnect',
    description: 'Build next-generation social media features focusing on user privacy and authentic connections.',
    requirements: {
      skills: ['React', 'Node.js', 'GraphQL', 'Redis', 'PostgreSQL'],
      experience: 'Entry level',
      education: 'Computer Science or Software Engineering'
    },
    responsibilities: [
      'Develop social media features',
      'Implement privacy controls',
      'Optimize database queries',
      'Build real-time messaging'
    ],
    location: {
      type: 'hybrid',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA'
    },
    type: 'internship',
    duration: '4 months',
    stipend: {
      amount: 3800,
      currency: 'USD',
      period: 'monthly'
    },
    category: 'Digital Marketing',
    applicationDeadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 157 * 24 * 60 * 60 * 1000),
    status: 'active'
  },

  // EcoSmart Solutions
  {
    title: 'Environmental Data Analyst Intern',
    company: null,
    companyName: 'EcoSmart Solutions',
    description: 'Analyze environmental data to develop smart solutions for sustainable living.',
    requirements: {
      skills: ['Python', 'R', 'GIS', 'Data Visualization', 'Environmental Science'],
      experience: 'Entry level',
      education: 'Environmental Science, Data Science, or Geography'
    },
    responsibilities: [
      'Analyze environmental datasets',
      'Create sustainability reports',
      'Develop predictive models',
      'Visualize environmental trends'
    ],
    location: {
      type: 'remote',
      city: 'Denver',
      state: 'CO',
      country: 'USA'
    },
    type: 'internship',
    duration: '6 months',
    stipend: {
      amount: 2500,
      currency: 'USD',
      period: 'monthly'
    },
    category: 'Data Science',
    applicationDeadline: new Date(Date.now() + 48 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 63 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 243 * 24 * 60 * 60 * 1000),
    status: 'active'
  },

  // VirtualReality Labs
  {
    title: 'VR/AR Developer Intern',
    company: null,
    companyName: 'VirtualReality Labs',
    description: 'Create immersive VR/AR experiences for entertainment and training applications.',
    requirements: {
      skills: ['Unity', 'Unreal Engine', 'C#', '3D Graphics', 'VR SDKs'],
      experience: 'Entry level',
      education: 'Computer Science, Game Development, or Digital Media'
    },
    responsibilities: [
      'Develop VR/AR applications',
      'Create 3D environments',
      'Implement user interactions',
      'Optimize performance for VR'
    ],
    location: {
      type: 'onsite',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA'
    },
    type: 'internship',
    duration: '5 months',
    stipend: {
      amount: 2800,
      currency: 'USD',
      period: 'monthly'
    },
    category: 'Software Development',
    applicationDeadline: new Date(Date.now() + 41 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 206 * 24 * 60 * 60 * 1000),
    status: 'active'
  },

  // BlockChain Ventures
  {
    title: 'Blockchain Developer Intern',
    company: null,
    companyName: 'BlockChain Ventures',
    description: 'Develop decentralized applications and smart contracts on various blockchain platforms.',
    requirements: {
      skills: ['Solidity', 'Web3.js', 'Ethereum', 'Smart Contracts', 'JavaScript'],
      experience: 'Entry level',
      education: 'Computer Science or Cryptography'
    },
    responsibilities: [
      'Write smart contracts',
      'Build DApps',
      'Test blockchain applications',
      'Research new blockchain technologies'
    ],
    location: {
      type: 'remote',
      city: 'Miami',
      state: 'FL',
      country: 'USA'
    },
    type: 'internship',
    duration: '4 months',
    stipend: {
      amount: 3400,
      currency: 'USD',
      period: 'monthly'
    },
    category: 'Software Development',
    applicationDeadline: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 41 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 161 * 24 * 60 * 60 * 1000),
    status: 'active'
  },

  // AutoDrive Systems
  {
    title: 'Autonomous Vehicle Software Intern',
    company: null,
    companyName: 'AutoDrive Systems',
    description: 'Work on self-driving car software including perception, planning, and control systems.',
    requirements: {
      skills: ['Python', 'C++', 'Computer Vision', 'ROS', 'Machine Learning'],
      experience: 'Entry level',
      education: 'Computer Science, Robotics, or Automotive Engineering'
    },
    responsibilities: [
      'Develop perception algorithms',
      'Implement path planning',
      'Test autonomous systems',
      'Analyze sensor data'
    ],
    location: {
      type: 'onsite',
      city: 'Phoenix',
      state: 'AZ',
      country: 'USA'
    },
    type: 'internship',
    duration: '6 months',
    stipend: {
      amount: 3600,
      currency: 'USD',
      period: 'monthly'
    },
    category: 'Software Development',
    applicationDeadline: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 44 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 224 * 24 * 60 * 60 * 1000),
    status: 'active'
  },

  // SpaceTech Dynamics
  {
    title: 'Aerospace Software Engineer Intern',
    company: null,
    companyName: 'SpaceTech Dynamics',
    description: 'Develop software for satellite systems and space exploration missions.',
    requirements: {
      skills: ['C++', 'Python', 'MATLAB', 'Embedded Systems', 'Control Systems'],
      experience: 'Entry level',
      education: 'Aerospace Engineering or Computer Science'
    },
    responsibilities: [
      'Develop satellite control software',
      'Implement navigation algorithms',
      'Test space systems',
      'Analyze mission data'
    ],
    location: {
      type: 'onsite',
      city: 'Houston',
      state: 'TX',
      country: 'USA'
    },
    type: 'internship',
    duration: '5 months',
    stipend: {
      amount: 3300,
      currency: 'USD',
      period: 'monthly'
    },
    category: 'Software Development',
    applicationDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
    status: 'active'
  },

  // BioTech Innovations
  {
    title: 'Bioinformatics Intern',
    company: null,
    companyName: 'BioTech Innovations',
    description: 'Apply computational methods to analyze biological data and support genetic research.',
    requirements: {
      skills: ['Python', 'R', 'Bioinformatics Tools', 'Statistics', 'Biology'],
      experience: 'Entry level',
      education: 'Bioinformatics, Biology, or Computer Science'
    },
    responsibilities: [
      'Analyze genomic data',
      'Develop bioinformatics pipelines',
      'Create data visualizations',
      'Support research projects'
    ],
    location: {
      type: 'hybrid',
      city: 'San Diego',
      state: 'CA',
      country: 'USA'
    },
    type: 'internship',
    duration: '4 months',
    stipend: {
      amount: 2700,
      currency: 'USD',
      period: 'monthly'
    },
    category: 'Research',
    applicationDeadline: new Date(Date.now() + 44 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 59 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 179 * 24 * 60 * 60 * 1000),
    status: 'active'
  },

  // SmartHome Tech
  {
    title: 'IoT Developer Intern',
    company: null,
    companyName: 'SmartHome Tech',
    description: 'Develop IoT solutions for smart home automation and connected devices.',
    requirements: {
      skills: ['Arduino', 'Raspberry Pi', 'IoT Protocols', 'Mobile Development', 'Cloud Platforms'],
      experience: 'Entry level',
      education: 'Computer Science, Electrical Engineering, or IoT'
    },
    responsibilities: [
      'Develop IoT device firmware',
      'Build mobile applications',
      'Implement cloud connectivity',
      'Test smart home systems'
    ],
    location: {
      type: 'onsite',
      city: 'San Jose',
      state: 'CA',
      country: 'USA'
    },
    type: 'internship',
    duration: '5 months',
    stipend: {
      amount: 2900,
      currency: 'USD',
      period: 'monthly'
    },
    category: 'Software Development',
    applicationDeadline: new Date(Date.now() + 39 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 54 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 204 * 24 * 60 * 60 * 1000),
    status: 'active'
  },

  // QuantumCompute Labs
  {
    title: 'Quantum Computing Research Intern',
    company: null,
    companyName: 'QuantumCompute Labs',
    description: 'Research and develop quantum computing algorithms and applications.',
    requirements: {
      skills: ['Python', 'Qiskit', 'Quantum Mechanics', 'Linear Algebra', 'Physics'],
      experience: 'Entry level',
      education: 'Physics, Computer Science, or Mathematics'
    },
    responsibilities: [
      'Implement quantum algorithms',
      'Conduct quantum experiments',
      'Analyze quantum circuits',
      'Write research papers'
    ],
    location: {
      type: 'onsite',
      city: 'Cambridge',
      state: 'MA',
      country: 'USA'
    },
    type: 'internship',
    duration: '6 months',
    stipend: {
      amount: 3500,
      currency: 'USD',
      period: 'monthly'
    },
    category: 'Research',
    applicationDeadline: new Date(Date.now() + 52 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 67 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 247 * 24 * 60 * 60 * 1000),
    status: 'active'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    if (!DEMO_DATA_ENABLED) {
      console.log('🚫 Demo data seeding is disabled in production mode');
      console.log('💡 To enable demo data for development, set ENABLE_DEMO_DATA=true in .env');
      console.log('✅ Database connection verified - ready for real users!');
      process.exit(0);
    }

    console.log('⚠️  DEVELOPMENT MODE: Seeding demo data...');

    // Clear existing data
    await User.deleteMany({});
    await Internship.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`Created ${createdUsers.length} sample users`);

    // Create a map of company names to user IDs
    const companyMap = {};
    createdUsers.forEach(user => {
      if (user.role === 'company') {
        companyMap[user.companyProfile.companyName] = user._id;
      }
    });

    // Update internships with correct company references
    const internshipsWithCompany = sampleInternships.map(internship => ({
      ...internship,
      company: companyMap[internship.companyName]
    }));

    // Create internships
    await Internship.insertMany(internshipsWithCompany);
    console.log(`Created ${internshipsWithCompany.length} sample internships`);

    console.log('\n✅ Sample data created successfully!');
    console.log(`\n📊 Created ${Object.keys(companyMap).length} companies with ${internshipsWithCompany.length} internships`);
    console.log('\nSample login credentials:');
    console.log('Company: hr@techcorp.com / password');
    console.log('Student: john@student.com / password');
    console.log('\nCompanies created:');
    Object.keys(companyMap).forEach(company => console.log(`- ${company}`));
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
