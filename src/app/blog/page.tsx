import Link from 'next/link';
import { blogPosts, blogCategories } from '@/data/blog-posts';
import { Clock, Calendar } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Palm Riders Blog - Siargao Travel Guides & Tips',
  description: 'Explore Siargao with our comprehensive travel guides. Tips on surfing, beaches, food, scooter touring, and everything you need for your island adventure.',
  keywords: [
    'Siargao travel blog',
    'Siargao guide',
    'Siargao tips',
    'Cloud 9 surfing',
    'Siargao beaches',
    'Siargao itinerary',
    'Siargao food guide',
    'scooter rental Siargao',
    'Palm Riders blog',
  ],
  openGraph: {
    title: 'Palm Riders Blog - Siargao Travel Guides & Tips',
    description: 'Explore Siargao with our comprehensive travel guides. Tips on surfing, beaches, food, and scooter touring.',
    type: 'website',
    images: [
      {
        url: '/images/hero-poster.webp',
        width: 1200,
        height: 630,
        alt: 'Palm Riders Blog - Siargao Travel Guides',
      },
    ],
  },
  alternates: {
    canonical: 'https://siargaoscooterrentals.com/blog',
  },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-800 dark:to-emerald-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Palm Riders Blog</h1>
          <p className="text-xl md:text-2xl text-teal-100">
            Your ultimate guide to exploring Siargao on two wheels
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {blogCategories.map((category) => (
            <button
              key={category}
              className="px-6 py-2 rounded-full bg-white dark:bg-slate-800 border-2 border-teal-500 dark:border-teal-400 text-teal-600 dark:text-teal-400 hover:bg-teal-500 hover:text-white dark:hover:bg-teal-600 transition-all font-semibold"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border border-slate-200 dark:border-slate-700"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-3 text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                {/* Read More */}
                <div className="mt-4 text-teal-600 dark:text-teal-400 font-semibold group-hover:translate-x-2 transition-transform inline-block">
                  Read More →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-800 dark:to-emerald-800 py-16 mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Explore Siargao?</h2>
          <p className="text-xl mb-8 text-teal-100">
            Rent a scooter and start your island adventure today!
          </p>
          <Link
            href="/#book"
            className="inline-block bg-white text-teal-600 font-bold py-4 px-8 rounded-lg hover:bg-teal-50 transition-all shadow-lg hover:shadow-xl"
          >
            Book Your Scooter Now 🏍️
          </Link>
        </div>
      </div>
    </div>
  );
}
