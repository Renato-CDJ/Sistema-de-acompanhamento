-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create carteiras table
CREATE TABLE IF NOT EXISTS carteiras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  total INTEGER DEFAULT 0,
  aplicados INTEGER DEFAULT 0,
  pendentes INTEGER DEFAULT 0,
  taxa DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create assuntos table
CREATE TABLE IF NOT EXISTS assuntos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create treinamentos table
CREATE TABLE IF NOT EXISTS treinamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quantidade INTEGER NOT NULL,
  turno TEXT NOT NULL,
  carteira TEXT NOT NULL,
  data DATE NOT NULL,
  responsavel TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Aplicado', 'Pendente')),
  assunto TEXT NOT NULL,
  carga_horaria TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create motivos_desligamento table
CREATE TABLE IF NOT EXISTS motivos_desligamento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create desligamentos table
CREATE TABLE IF NOT EXISTS desligamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  carteira TEXT NOT NULL,
  turno TEXT NOT NULL,
  data DATE NOT NULL,
  motivo TEXT NOT NULL,
  aviso_previa TEXT NOT NULL CHECK (aviso_previa IN ('Com', 'Sem')),
  responsavel TEXT NOT NULL,
  veio_agencia TEXT NOT NULL CHECK (veio_agencia IN ('Sim', 'Não')),
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create dados_diarios table
CREATE TABLE IF NOT EXISTS dados_diarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  turno TEXT NOT NULL,
  total INTEGER NOT NULL,
  ativos INTEGER NOT NULL,
  ferias INTEGER NOT NULL,
  afastamento INTEGER NOT NULL,
  desaparecidos INTEGER NOT NULL,
  inss INTEGER NOT NULL,
  secao TEXT NOT NULL CHECK (secao IN ('Caixa', 'Cobrança')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create estatisticas_carteiras table
CREATE TABLE IF NOT EXISTS estatisticas_carteiras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  carteira TEXT NOT NULL,
  turno TEXT NOT NULL,
  total INTEGER NOT NULL,
  presentes INTEGER NOT NULL,
  faltas INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create operadores table
CREATE TABLE IF NOT EXISTS operadores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  assunto TEXT NOT NULL,
  data_conlusao DATE NOT NULL,
  carteira TEXT NOT NULL,
  turno TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create agentes table
CREATE TABLE IF NOT EXISTS agentes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operador TEXT NOT NULL,
  carteira TEXT NOT NULL,
  gestor TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Ativo', 'Desligado', 'Férias')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create monitoring_data table
CREATE TABLE IF NOT EXISTS monitoring_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  week_id TEXT NOT NULL,
  conforme INTEGER NOT NULL,
  inconforme INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(year, month, week_id)
);

-- Create tia_data table
CREATE TABLE IF NOT EXISTS tia_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  analisados INTEGER NOT NULL,
  quantidade INTEGER NOT NULL,
  total_percent DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details TEXT NOT NULL,
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create agendas table
CREATE TABLE IF NOT EXISTS agendas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  participants TEXT[] DEFAULT '{}',
  created_by TEXT NOT NULL,
  notified_24h BOOLEAN DEFAULT FALSE,
  notified_hours BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('global', 'group', 'private')),
  name TEXT,
  participants TEXT[] DEFAULT '{}',
  created_by TEXT NOT NULL,
  last_message TEXT,
  last_message_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB,
  mentions TEXT[] DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  pinned BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size BIGINT NOT NULL,
  path TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_treinamentos_carteira ON treinamentos(carteira);
CREATE INDEX IF NOT EXISTS idx_treinamentos_status ON treinamentos(status);
CREATE INDEX IF NOT EXISTS idx_desligamentos_data ON desligamentos(data);
CREATE INDEX IF NOT EXISTS idx_dados_diarios_date ON dados_diarios(date);
CREATE INDEX IF NOT EXISTS idx_estatisticas_carteiras_date ON estatisticas_carteiras(date);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_agendas_date ON agendas(date);
