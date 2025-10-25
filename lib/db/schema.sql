-- JuryBox Database Schema
-- Simple schema with agents, orchestrators, and judges

-- Judges Table (Agent Configuration)
CREATE TABLE judges (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Basic Information
  name VARCHAR(255) NOT NULL,                    -- Agent Name (e.g., Dr. Academic)
  title VARCHAR(255),                            -- Professional Title (e.g., Research Specialist)
  tagline TEXT,                                  -- JSON array of tags (e.g., ["Academic", "Creative", "Technical"])
  description TEXT,                              -- Biography / Description
  avatar VARCHAR(500),                           -- Agent Image URL or IPFS hash
  theme_color VARCHAR(7) DEFAULT '#8B5CF6',      -- Theme Color (hex code)

  -- Specialties
  specialties TEXT,                              -- JSON array of specialties

  -- AI Model Configuration
  model_provider VARCHAR(50) DEFAULT 'OpenAI',   -- Model Provider (OpenAI, Anthropic, etc.)
  model_name VARCHAR(100) DEFAULT 'gpt-4',       -- Model Name (gpt-4, claude-3, etc.)
  system_prompt TEXT NOT NULL,                   -- System Prompt for AI
  temperature DECIMAL(3, 2) DEFAULT 0.70,        -- Temperature (0.00 - 1.00)

  -- Pricing & Performance
  price DECIMAL(10, 3) NOT NULL DEFAULT 0.050,   -- Price per judgment

  -- Payment Configuration (X402/A2A)
  wallet_address VARCHAR(255),                   -- Hedera account ID or EVM address to receive payments
  payment_page_url VARCHAR(500),                 -- X402/A2A payment page URL

  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_judgments INT DEFAULT 0,

  -- IPFS Metadata
  ipfs_cid VARCHAR(255),                         -- IPFS CID for agent metadata

  -- Status
  status ENUM('active', 'inactive') DEFAULT 'active',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_status (status),
  INDEX idx_rating (rating),
  INDEX idx_model_provider (model_provider),
  INDEX idx_ipfs_cid (ipfs_cid)
);

-- Orchestrators Table
CREATE TABLE orchestrators (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  user_address VARCHAR(255) NOT NULL,
  status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',

  -- AA Wallet Information
  wallet_account_id VARCHAR(255) NOT NULL UNIQUE,
  wallet_evm_address VARCHAR(255) NOT NULL UNIQUE,
  wallet_private_key_encrypted TEXT NOT NULL,
  wallet_balance DECIMAL(20, 8) DEFAULT 0.00000000,

  -- Configuration
  max_discussion_rounds INT DEFAULT 3,
  round_timeout INT DEFAULT 300,
  consensus_algorithm ENUM('majority', 'unanimous', 'weighted') DEFAULT 'majority',
  enable_discussion BOOLEAN DEFAULT true,
  convergence_threshold DECIMAL(3, 2) DEFAULT 0.75,
  outlier_detection BOOLEAN DEFAULT true,

  -- Round Management
  rounds_completed INT DEFAULT 0,
  rounds_total INT DEFAULT 0,
  rounds_current INT DEFAULT 0,

  -- HCS Topic
  hcs_topic_id VARCHAR(255),

  -- Metadata
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_user_address (user_address),
  INDEX idx_status (status),
  INDEX idx_wallet_account_id (wallet_account_id),
  INDEX idx_wallet_evm_address (wallet_evm_address)
);

-- Orchestrator Judges (Many-to-Many)
CREATE TABLE orchestrator_judges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orchestrator_id VARCHAR(255) NOT NULL,
  judge_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (orchestrator_id) REFERENCES orchestrators(id) ON DELETE CASCADE,
  FOREIGN KEY (judge_id) REFERENCES judges(id) ON DELETE CASCADE,
  UNIQUE KEY unique_orchestrator_judge (orchestrator_id, judge_id)
);

-- Agents Table (for multi-agent evaluations)
CREATE TABLE agents (
  id VARCHAR(255) PRIMARY KEY,
  orchestrator_id VARCHAR(255) NOT NULL,
  judge_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  status ENUM('active', 'inactive', 'busy') DEFAULT 'active',

  -- Agent wallet for payments
  agent_wallet_account_id VARCHAR(255),
  agent_wallet_evm_address VARCHAR(255),

  -- Performance metrics
  total_evaluations INT DEFAULT 0,
  average_score DECIMAL(3, 2) DEFAULT 0.00,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (orchestrator_id) REFERENCES orchestrators(id) ON DELETE CASCADE,
  FOREIGN KEY (judge_id) REFERENCES judges(id) ON DELETE CASCADE,
  INDEX idx_orchestrator (orchestrator_id),
  INDEX idx_status (status)
);

-- Evaluations Table
CREATE TABLE evaluations (
  id VARCHAR(255) PRIMARY KEY,
  orchestrator_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  criteria TEXT,

  -- Results
  consensus_score DECIMAL(3, 2),
  confidence DECIMAL(3, 2),
  variance DECIMAL(5, 3),
  convergence_rounds INT,
  algorithm VARCHAR(50),

  -- Status
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',

  -- HCS
  hcs_topic_id VARCHAR(255),

  -- Timing
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (orchestrator_id) REFERENCES orchestrators(id) ON DELETE CASCADE,
  INDEX idx_orchestrator (orchestrator_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Evaluation Judgments
CREATE TABLE evaluation_judgments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evaluation_id VARCHAR(255) NOT NULL,
  judge_id INT NOT NULL,
  agent_id VARCHAR(255),

  -- Scores
  score DECIMAL(3, 2) NOT NULL,
  initial_score DECIMAL(3, 2),
  final_score DECIMAL(3, 2),

  -- Feedback
  feedback TEXT,
  strengths JSON,
  improvements JSON,
  reasoning TEXT,

  -- Metadata
  round_number INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE,
  FOREIGN KEY (judge_id) REFERENCES judges(id) ON DELETE CASCADE,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL,
  INDEX idx_evaluation (evaluation_id),
  INDEX idx_judge (judge_id)
);

-- Insert default judges
INSERT INTO judges (name, title, tagline, description, avatar, theme_color, specialties, model_provider, model_name, system_prompt, temperature, price, rating) VALUES
('Dr. Alex Chen', 'AI Researcher & Technical Expert', '["Technical", "AI/ML"]', 'AI researcher with deep expertise in machine learning, system architecture, and performance optimization. Evaluates technical content with focus on innovation and implementation quality.', '/judges/alex-chen.jpg', '#8B5CF6', '["AI/ML", "System Architecture", "Performance Optimization"]', 'OpenAI', 'gpt-4', 'You are Dr. Alex Chen, a technical expert specializing in AI/ML, system architecture, and performance optimization. Evaluate content with focus on technical accuracy, innovation, and implementation quality.', 0.70, 0.050, 4.9),
('Prof. Sarah Martinez', 'Academic & Research Professional', '["Academic", "Research"]', 'Academic professional specializing in research methodology and scholarly analysis. Brings rigorous academic standards to content evaluation.', '/judges/sarah-martinez.jpg', '#06B6D4', '["Research Methodology", "Academic Writing", "Critical Analysis"]', 'OpenAI', 'gpt-4', 'You are Prof. Sarah Martinez, an academic professional. Evaluate content with focus on research rigor, methodology, citations, and scholarly quality.', 0.70, 0.045, 4.8),
('James Wilson', 'Creative Designer & UX Expert', '["Creative", "Design"]', 'Creative design expert with focus on user experience and visual communication. Evaluates content through the lens of design principles and user engagement.', '/judges/james-wilson.jpg', '#F59E0B', '["Design", "UX/UI", "Visual Communication"]', 'OpenAI', 'gpt-4', 'You are James Wilson, a creative design expert. Evaluate content with focus on visual appeal, user experience, creativity, and design principles.', 0.70, 0.040, 4.7),
('Maria Rodriguez', 'Business Strategy Consultant', '["Business", "Strategy"]', 'Business strategy consultant with expertise in market analysis and ROI optimization. Evaluates content for business value and practical applicability.', '/judges/maria-rodriguez.jpg', '#8B5CF6', '["Business Strategy", "Market Analysis", "ROI"]', 'OpenAI', 'gpt-4', 'You are Maria Rodriguez, a business strategy consultant. Evaluate content with focus on business value, market fit, scalability, and ROI.', 0.70, 0.055, 4.9),
('Dr. Emily Thompson', 'Data Science & Analytics Expert', '["Data Science", "Analytics"]', 'Data science expert specializing in statistical analysis and machine learning. Evaluates content with focus on data quality and analytical rigor.', '/judges/emily-thompson.jpg', '#06B6D4', '["Data Analysis", "Statistics", "Machine Learning"]', 'OpenAI', 'gpt-4', 'You are Dr. Emily Thompson, a data science expert. Evaluate content with focus on data quality, statistical rigor, analytical methods, and insights.', 0.70, 0.050, 4.8);
