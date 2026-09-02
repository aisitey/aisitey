import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Calendar, Clock, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col bg-base">
      <Navbar />

      <article className="flex-1 pt-32">
        <div className="mx-auto max-w-3xl px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-copy-muted hover:text-brand transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Blog
          </Link>

          <div className="mt-8">
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

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-copy-primary md:text-5xl">
              {post.title}
            </h1>

            {/* ✅ الصورة تظهر كاملة بدون قص */}
            {post.imageUrl && (
              <div className="relative mt-8 h-64 w-full overflow-hidden rounded-2xl border border-default bg-white md:h-96">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-contain"  // ✨ تغيير من cover إلى contain
                />
              </div>
            )}

            {post.mediumUrl && (
              <a
                href={post.mediumUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-default bg-surface px-5 py-3 text-sm font-medium text-copy-primary transition hover:border-brand hover:text-brand"
              >
                📖 Read on Medium
                <ExternalLink className="size-4" />
              </a>
            )}
          </div>

          <div className="mt-12 mb-32 prose prose-lg max-w-none">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}