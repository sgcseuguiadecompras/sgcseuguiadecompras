// ===========================================
// Tipos baseados nas tabelas do Supabase
// ===========================================

// Tabela: lojas
export interface Loja {
  id: string
  nome: string
  icone?: string
}

// Tabela: cupons
export interface Cupom {
  id: string
  codigo: string
  descricao?: string
  validade?: string
}

// Tabela: categorias
export interface Categoria {
  id: string
  nome: string
  slug: string
}

// Tabela: produtos
export interface Produto {
  id: string
  nome: string
  descricao?: string
  imagem?: string[] | string | null  // Agora é um array de strings
  preco: number
  avaliacao?: number
  loja_id?: string
  cupom_id?: string
  link_afiliado?: string
}

// Tabela: produto_categorias (ligação N:N)
export interface ProdutoCategoria {
  produto_id: string
  categoria_id: string
}

// Produto com dados relacionados (JOIN)
export interface ProdutoComRelacoes extends Produto {
  lojas?: Loja
  cupons?: Cupom
  categorias?: Categoria[]
}
