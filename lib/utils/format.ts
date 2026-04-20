// Formatar preço para exibição no formato brasileiro
export function formatPrice(price: number | undefined | null): string {
  if (price === undefined || price === null || isNaN(price)) {
    return "R$ 0,00"
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

// Converter string de preço brasileiro para número
// Aceita: "5.955,08" ou "5955.08" ou "5955,08"
export function parsePrice(priceStr: string): number {
  if (!priceStr || typeof priceStr !== 'string') {
    return 0
  }
  
  // Remove espaços e R$
  let cleaned = priceStr.trim().replace(/R\$\s*/g, '').replace(/\s/g, '')
  
  // Detecta formato brasileiro (ponto como separador de milhar, vírgula como decimal)
  // Ex: "5.955,08" -> tem ponto E vírgula, sendo vírgula o decimal
  const hasBothSeparators = cleaned.includes('.') && cleaned.includes(',')
  
  if (hasBothSeparators) {
    // Formato brasileiro: 5.955,08
    cleaned = cleaned.replace(/\./g, '').replace(',', '.')
  } else if (cleaned.includes(',')) {
    // Só vírgula: 5955,08 (assume vírgula como decimal)
    cleaned = cleaned.replace(',', '.')
  }
  // Se só tem ponto, mantém como está (formato americano)
  
  const value = parseFloat(cleaned)
  return isNaN(value) ? 0 : value
}

// Formatar preço para input no formato brasileiro (ex: 1.999,99)
export function formatPriceForInput(price: number | undefined | null): string {
  if (price === undefined || price === null || isNaN(price) || price === 0) {
    return ""
  }
  // Formata no padrão brasileiro sem o símbolo R$
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}
