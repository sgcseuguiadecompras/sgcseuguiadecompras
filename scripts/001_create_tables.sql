-- Criar tabela de lojas
CREATE TABLE IF NOT EXISTS lojas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  icone TEXT
);

-- Criar tabela de cupons
CREATE TABLE IF NOT EXISTS cupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL,
  descricao TEXT,
  validade TIMESTAMP WITH TIME ZONE
);

-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  imagem TEXT,
  preco DECIMAL(10, 2) NOT NULL DEFAULT 0,
  avaliacao DECIMAL(2, 1) DEFAULT 0,
  loja_id UUID REFERENCES lojas(id) ON DELETE SET NULL,
  cupom_id UUID REFERENCES cupons(id) ON DELETE SET NULL,
  link_afiliado TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de ligação produto-categorias
CREATE TABLE IF NOT EXISTS produto_categorias (
  produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
  PRIMARY KEY (produto_id, categoria_id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produto_categorias ENABLE ROW LEVEL SECURITY;

-- Criar políticas de leitura pública para todas as tabelas (site público)
CREATE POLICY "Permitir leitura pública de lojas" ON lojas
  FOR SELECT USING (true);

CREATE POLICY "Permitir leitura pública de cupons" ON cupons
  FOR SELECT USING (true);

CREATE POLICY "Permitir leitura pública de categorias" ON categorias
  FOR SELECT USING (true);

CREATE POLICY "Permitir leitura pública de produtos" ON produtos
  FOR SELECT USING (true);

CREATE POLICY "Permitir leitura pública de produto_categorias" ON produto_categorias
  FOR SELECT USING (true);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_produtos_loja_id ON produtos(loja_id);
CREATE INDEX IF NOT EXISTS idx_produtos_cupom_id ON produtos(cupom_id);
CREATE INDEX IF NOT EXISTS idx_produtos_avaliacao ON produtos(avaliacao DESC);
CREATE INDEX IF NOT EXISTS idx_produto_categorias_produto_id ON produto_categorias(produto_id);
CREATE INDEX IF NOT EXISTS idx_produto_categorias_categoria_id ON produto_categorias(categoria_id);
