create database balance_tool;
use balance_tool;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  role ENUM('analyst', 'ceo', 'admin') NOT NULL,
  company_id INT
);
CREATE TABLE companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  parent_company_id INT DEFAULT NULL,
  FOREIGN KEY (parent_company_id) REFERENCES companies(id)
);
INSERT INTO companies (name, parent_company_id) VALUES
('Reliance Industries', NULL),
('Jio Platforms', 1),
('Reliance Retail Ventures', 1),
('Reliance Oil & Gas', 1),
('Ambani Family Group', NULL);  
select * from companies;

CREATE TABLE balance_sheets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT,
  year INT,
  revenue DECIMAL(15,2),
  profit DECIMAL(15,2),
  assets DECIMAL(15,2),
  liabilities DECIMAL(15,2),
  growth DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);
select * from users;
select * from balance_sheets;
desc users;

CREATE TABLE chat_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  company_id INT,
  question TEXT,
  answer TEXT,
  response_type ENUM('text', 'chart', 'image') DEFAULT 'text',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

select * from chat_history;