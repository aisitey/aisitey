"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ArrowLeft, FileText, Download, Copy, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const allFiles = [
  "project-overview.md",
  "architecture.md",
  "ui-context.md",
  "code-standards.md",
  "ai-workflow-rules.md",
  "memory.md",
  "progress-tracker.md",
];

export default function ProjectPage() {
  const { id } = useParams();
  const [completedFiles, setCompletedFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/wizard-progress?project_id=${id}`);
        const data = await response.json();
        
        if (data.progress?.completed_files) {
          setCompletedFiles(data.progress.completed_files);
        }
      } catch (error) {
        console.error('Failed to fetch progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [id]);

  return (
    <main className="flex min-h-screen flex-col bg-base">
      <Navbar />

      <div className="flex-1 pt-32">
        <div className="mx-auto max-w-4xl px-6 pb-32">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-copy-muted hover:text-brand transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>

          <div className="mt-8">
            <h1 className="text-4xl font-semibold text-copy-primary">
              Context Files
            </h1>
            <p className="mt-3 text-lg text-copy-secondary">
              {completedFiles.length} of {allFiles.length} files completed
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 h-2 w-full rounded-full bg-subtle">
            <div
              className="h-full rounded-full bg-brand transition-all duration-500"
              style={{ width: `${(completedFiles.length / allFiles.length) * 100}%` }}
            />
          </div>

          {/* Files List */}
          <div className="mt-12 space-y-4">
            {allFiles.map((fileName) => {
              const isCompleted = completedFiles.includes(fileName);
              const isNext = completedFiles.length === allFiles.indexOf(fileName);

              return (
                <div
                  key={fileName}
                  className={`rounded-2xl border p-5 transition-all ${
                    isCompleted
                      ? "border-green-500/30 bg-green-50"
                      : isNext
                      ? "border-brand/30 bg-brand-soft"
                      : "border-default bg-surface"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className={`size-4 ${isCompleted ? "text-green-600" : "text-copy-muted"}`} />
                      <span className="text-sm font-mono font-medium text-copy-primary">
                        {fileName}
                      </span>
                    </div>

                    {isCompleted ? (
                      <div className="flex gap-2">
                        <button className="flex size-8 items-center justify-center rounded-lg border border-default text-copy-muted hover:text-brand">
                          <Copy className="size-3.5" />
                        </button>
                        <button className="flex size-8 items-center justify-center rounded-lg border border-default text-copy-muted hover:text-brand">
                          <Download className="size-3.5" />
                        </button>
                        <span className="flex size-8 items-center justify-center rounded-lg bg-green-500 text-white">
                          <Check className="size-3.5" />
                        </span>
                      </div>
                    ) : isNext ? (
                      <Link
                        href={`/dashboard/new-project/wizard?step=${allFiles.indexOf(fileName) + 1}&project_id=${id}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-xs font-medium text-white hover:bg-brand-dark"
                      >
                        Continue
                        <ArrowRight className="size-3.5" />
                      </Link>
                    ) : (
                      <span className="text-xs text-copy-muted">Locked</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}