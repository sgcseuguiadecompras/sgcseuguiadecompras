import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const baseUrl = 'https://www.sgcseuguiadecompras.com.br'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Retornar sitemap básico se não houver conexão com Supabase
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/cupons`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
    ]
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Buscar produtos com slugs
  const { data: produtos } = await supabase
    .from('produtos')
    .select('slug, updated_at')
    .not('slug', 'is', null)
    .order('updated_at', { ascending: false })

  // Buscar categorias
  const { data: categorias } = await supabase
    .from('categorias')
    .select('slug, updated_at')
    .not('slug', 'is', null)

  // Buscar posts do blog publicados
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('publicado', true)
    .order('updated_at', { ascending: false })

  // URLs estáticas
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/cupons`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/salvos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ]

  // URLs de produtos
  const productUrls: MetadataRoute.Sitemap = (produtos || []).map((produto) => ({
    url: `${baseUrl}/produto/${produto.slug}`,
    lastModified: produto.updated_at ? new Date(produto.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // URLs de categorias
  const categoryUrls: MetadataRoute.Sitemap = (categorias || []).map((categoria) => ({
    url: `${baseUrl}/categoria/${categoria.slug}`,
    lastModified: categoria.updated_at ? new Date(categoria.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // URLs de posts do blog
  const blogUrls: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticUrls, ...productUrls, ...categoryUrls, ...blogUrls]
}
