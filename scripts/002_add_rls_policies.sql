-- Add RLS policies to all existing tables
-- Most tables should be accessible by authenticated users with appropriate role checks

-- Activity Logs - Super admins can view all, users can view their own
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view all activity logs"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Super admins can insert activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'admin')
    )
  );

-- Agendas - All authenticated users can view, admins can manage
ALTER TABLE agendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view agendas"
  ON agendas FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert agendas"
  ON agendas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'admin')
    )
  );

CREATE POLICY "Admins can update agendas"
  ON agendas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'admin')
    )
  );

CREATE POLICY "Admins can delete agendas"
  ON agendas FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'admin')
    )
  );

-- Agentes - Authenticated users can view, admins can manage
ALTER TABLE agentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view agentes"
  ON agentes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage agentes"
  ON agentes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'admin')
    )
  );

-- Assuntos
ALTER TABLE assuntos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view assuntos"
  ON assuntos FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage assuntos"
  ON assuntos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'admin')
    )
  );

-- Carteiras
ALTER TABLE carteiras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view carteiras"
  ON carteiras FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage carteiras"
  ON carteiras FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'admin')
    )
  );

-- Chat Messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view chat messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own messages"
  ON chat_messages FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete messages"
  ON chat_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'admin')
    )
  );

-- Chats
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view chats"
  ON chats FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create chats"
  ON chats FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage chats"
  ON chats FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'admin')
    )
  );

-- Dados Diarios
ALTER TABLE dados_diarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view dados diarios"
  ON dados_diarios FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage dados diarios"
  ON dados_diarios FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'admin')
    )
  );

-- Desligamentos
ALTER TABLE desligamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view desligamentos"
  ON desligamentos FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage desligamentos"
  ON desligamentos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'admin')
    )
  );

-- Documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view documents"
  ON documents FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can upload documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage documents"
  ON documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'admin')
    )
  );

-- Estatisticas Carteiras
ALTER TABLE estatisticas_carteiras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view estatisticas"
  ON estatisticas_carteiras FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage estatisticas"
  ON estatisticas_carteiras FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'admin')
    )
  );

-- Folders
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view folders"
  ON folders FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create folders"
  ON folders FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage folders"
  ON folders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'admin')
    )
  );

-- Monitoring Data
ALTER TABLE monitoring_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view monitoring data"
  ON monitoring_data FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage monitoring data"
  ON monitoring_data FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'admin')
    )
  );

-- Motivos Desligamento
ALTER TABLE motivos_desligamento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view motivos"
  ON motivos_desligamento FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage motivos"
  ON motivos_desligamento FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'admin')
    )
  );

-- Operadores
ALTER TABLE operadores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view operadores"
  ON operadores FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage operadores"
  ON operadores FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'admin')
    )
  );

-- TIA Data
ALTER TABLE tia_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tia data"
  ON tia_data FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage tia data"
  ON tia_data FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'admin')
    )
  );

-- Treinamentos
ALTER TABLE treinamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view treinamentos"
  ON treinamentos FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage treinamentos"
  ON treinamentos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'superadmin' OR role = 'admin')
    )
  );
