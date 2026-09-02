import { getAllPosts } from '@/lib/posts';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import Image from 'next/image';

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="flex min-h-screen flex-col bg-base">
      <Navbar />
      
      <div className="flex-1 pt-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-semibold text-copy-primary">Blog</h1>
              <p className="mt-4 text-lg text-copy-secondary">
                Articles, tutorials, and case studies.
              </p>
            </div>

            <a
              href="https://medium.com/@walaafekry.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-default bg-surface px-5 py-3 text-sm font-medium text-copy-primary transition hover:border-brand hover:text-brand"
            >
              📖 Follow on Medium
              <ExternalLink className="size-4" />
            </a>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <div
                key={post.slug}
                className="group rounded-3xl border border-default bg-surface p-8 transition-all hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg"
              >
                {/* ✅ الصورة تظهر كاملة بدون قص */}
                {post.imageUrl && (
                  <div className="relative mb-6 h-48 w-full overflow-hidden rounded-2xl border border-default bg-white">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-contain"  // ✨ تغيير من cover إلى contain
                    />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-copy-muted">
                    <Calendar className="size-3" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-copy-muted">
                    <Clock className="size-3" />
                    {post.readTime}
                  </span>
                </div>

                <h2 className="mt-4 text-2xl font-semibold text-copy-primary">
                  {post.title}
                </h2>

                <p className="mt-3 text-sm leading-6 text-copy-secondary">
                  {post.excerpt}
                </p>

                {post.mediumUrl ? (
                  <a
                    href={post.mediumUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand transition hover:text-brand-dark"
                  >
                    Read on Medium
                    <ExternalLink className="size-3.5" />
                  </a>
                ) : (
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand transition hover:text-brand-dark"
                  >
                    Read Article
                    <ArrowRight className="size-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}