// ===========================================
// SGC - Database Layer
// Exportação centralizada
// ===========================================

// Schema e tipos
export * from './schema'

// Repositories
export { storeRepository } from './repositories/stores'
export { categoryRepository } from './repositories/categories'
export { productRepository } from './repositories/products'
export { productLinkRepository } from './repositories/product-links'
export { couponRepository } from './repositories/coupons'
export { reviewRepository } from './repositories/reviews'

// Helpers
export { paginate, sortItems, isNotExpired, generateId } from './repositories/base'

// Seed data (apenas para desenvolvimento)
export * as seedData from './seed'
