import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPost, blogPosts } from '@/data/blog-posts';
import { Clock, Calendar, ArrowLeft, User } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: [
      'Siargao travel guide',
      'Siargao scooter rental',
      'Siargao tourism',
      post.category,
      'Palm Riders',
      'Siargao island',
    ],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
    alternates: {
      canonical: `https://siargaoscooterrentals.com/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  // Get related posts (same category, exclude current)
  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  // Article Schema for SEO
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.image,
    "author": {
      "@type": "Organization",
      "name": post.author,
      "url": "https://siargaoscooterrentals.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Palm Riders",
      "logo": {
        "@type": "ImageObject",
        "url": "https://siargaoscooterrentals.com/images/hero-poster.webp"
      }
    },
    "datePublished": post.date,
    "dateModified": post.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://siargaoscooterrentals.com/blog/${slug}`
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Article Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Hero Image */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Back Button */}
        <Link
          href="/blog"
          className="absolute top-8 left-8 flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 px-4 py-2 rounded-lg transition-all shadow-lg backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back to Blog</span>
        </Link>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            <span className="bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
              {post.category}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Excerpt */}
        <div className="text-xl text-slate-600 dark:text-slate-300 mb-12 pb-12 border-b-2 border-slate-200 dark:border-slate-700 font-medium leading-relaxed">
          {post.excerpt}
        </div>

        {/* Main Content */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:text-slate-800 dark:prose-headings:text-slate-200
            prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-12
            prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-10
            prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-8
            prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-6
            prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-strong:font-bold
            prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
            prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
            prose-li:mb-2 prose-li:text-slate-700 dark:prose-li:text-slate-300
            prose-a:text-teal-600 dark:prose-a:text-teal-400 prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-4 prose-blockquote:border-teal-500 prose-blockquote:pl-4 prose-blockquote:italic
            prose-code:text-teal-600 dark:prose-code:text-teal-400 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1 prose-code:rounded
          "
          dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
        />
      </article>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-800 dark:to-emerald-800 py-16 my-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Experience This Yourself?</h2>
          <p className="text-xl mb-8 text-teal-100">
            Rent a scooter from Palm Riders and explore Siargao!
          </p>
          <Link
            href="/#book"
            className="inline-block bg-white text-teal-600 font-bold py-4 px-8 rounded-lg hover:bg-teal-50 transition-all shadow-lg hover:shadow-xl"
          >
            Book Your Scooter Now 🏍️
          </Link>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl font-bold mb-8 text-slate-800 dark:text-slate-200">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.id}
                href={`/blog/${relatedPost.slug}`}
                className="group bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border border-slate-200 dark:border-slate-700"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={relatedPost.image}
                    alt={relatedPost.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {relatedPost.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>{relatedPost.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
