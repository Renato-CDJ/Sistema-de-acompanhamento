-- Enable Row Level Security on all tables
ALTER TABLE carteiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE assuntos ENABLE ROW LEVEL SECURITY;
ALTER TABLE treinamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE motivos_desligamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE desligamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE dados_diarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE estatisticas_carteiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE operadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE tia_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is an internal management system)
-- In a production environment, you would want more restrictive policies based on auth.uid()

-- Carteiras policies
CREATE POLICY "Allow all operations on carteiras" ON carteiras FOR ALL USING (true) WITH CHECK (true);

-- Assuntos policies
CREATE POLICY "Allow all operations on assuntos" ON assuntos FOR ALL USING (true) WITH CHECK (true);

-- Treinamentos policies
CREATE POLICY "Allow all operations on treinamentos" ON treinamentos FOR ALL USING (true) WITH CHECK (true);

-- Motivos desligamento policies
CREATE POLICY "Allow all operations on motivos_desligamento" ON motivos_desligamento FOR ALL USING (true) WITH CHECK (true);

-- Desligamentos policies
CREATE POLICY "Allow all operations on desligamentos" ON desligamentos FOR ALL USING (true) WITH CHECK (true);

-- Dados diarios policies
CREATE POLICY "Allow all operations on dados_diarios" ON dados_diarios FOR ALL USING (true) WITH CHECK (true);

-- Estatisticas carteiras policies
CREATE POLICY "Allow all operations on estatisticas_carteiras" ON estatisticas_carteiras FOR ALL USING (true) WITH CHECK (true);

-- Operadores policies
CREATE POLICY "Allow all operations on operadores" ON operadores FOR ALL USING (true) WITH CHECK (true);

-- Agentes policies
CREATE POLICY "Allow all operations on agentes" ON agentes FOR ALL USING (true) WITH CHECK (true);

-- Monitoring data policies
CREATE POLICY "Allow all operations on monitoring_data" ON monitoring_data FOR ALL USING (true) WITH CHECK (true);

-- TIA data policies
CREATE POLICY "Allow all operations on tia_data" ON tia_data FOR ALL USING (true) WITH CHECK (true);

-- Activity logs policies
CREATE POLICY "Allow all operations on activity_logs" ON activity_logs FOR ALL USING (true) WITH CHECK (true);

-- Agendas policies
CREATE POLICY "Allow all operations on agendas" ON agendas FOR ALL USING (true) WITH CHECK (true);

-- Chats policies
CREATE POLICY "Allow all operations on chats" ON chats FOR ALL USING (true) WITH CHECK (true);

-- Chat messages policies
CREATE POLICY "Allow all operations on chat_messages" ON chat_messages FOR ALL USING (true) WITH CHECK (true);

-- Documents policies
CREATE POLICY "Allow all operations on documents" ON documents FOR ALL USING (true) WITH CHECK (true);

-- Folders policies
CREATE POLICY "Allow all operations on folders" ON folders FOR ALL USING (true) WITH CHECK (true);
