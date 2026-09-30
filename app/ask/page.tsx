"use client";

import { FormEvent, useState } from "react";

type Source = {
  feedbackId: number;
  text: string;
  sentiment: string | null;
  sentimentScore: number | null;
  featureArea: string | null;
  rating: number | null;
  themes: string[];
  source: string;
  createdAt: string;
};

type AskResponse = {
  success: boolean;
  data?: {
    question: string;
    answer: string;
    sources: Source[];
  };
  message?: string;
};

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setError("Please enter a question.");
      return;
    }

    setLoading(true);
    setError("");
    setAnswer("");
    setSources([]);

    try {
      const response = await fetch("/api/ai/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmedQuestion,
        }),
      });

      const result: AskResponse = await response.json();

      console.log("ASK LOOP RESULT:", result);

      if (!response.ok || !result.success || !result.data) {
        throw new Error(
          result.message || "Failed to get an answer."
        );
      }

      setAnswer(result.data.answer);
      setSources(result.data.sources || []);
    } catch (err) {
      console.error("Ask LOOP failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            LOOP Intelligence
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Ask LOOP
          </h1>

          <p className="mt-3 text-lg text-slate-600">
            Ask questions about your customer feedback and get
            AI-powered, evidence-based answers.
          </p>
        </div>

        {/* ASK BOX */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleAsk}>

            <label
              htmlFor="question"
              className="mb-3 block text-sm font-semibold text-slate-900"
            >
              Ask a question
            </label>

            <textarea
              id="question"
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              placeholder="What are the main problems customers are facing?"
              maxLength={500}
              disabled={loading}
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-black outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-xs text-slate-500">
                Press Enter to ask. Use Shift + Enter for a new line.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Thinking..." : "Ask LOOP"}
              </button>

            </div>

            <p className="mt-2 text-xs text-slate-400">
              Maximum 500 characters.
            </p>

          </form>

          {/* ERROR */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* ANSWER */}
        {answer && (
          <div className="mt-8 rounded-2xl border border-blue-200 bg-white shadow-sm">

            <div className="border-b border-blue-100 bg-blue-50 px-6 py-4">
              <h2 className="text-lg font-bold text-blue-700">
                LOOP Answer
              </h2>
            </div>

            <div className="p-6">
              <p className="whitespace-pre-wrap text-base leading-7 text-slate-800">
                {answer}
              </p>
            </div>

          </div>
        )}

        {/* SOURCES */}
        {sources.length > 0 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

              <h2 className="text-lg font-bold text-slate-900">
                Evidence from Customer Feedback
              </h2>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                {sources.length} sources
              </span>

            </div>

            <div className="space-y-4 p-6">

              {sources.map((source, index) => (
                <div
                  key={`${source.feedbackId}-${index}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                >

                  <div className="flex flex-wrap gap-2">

                    <span className="rounded-md bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">
                      Feedback #{source.feedbackId}
                    </span>

                    {source.sentiment && (
                      <span className="rounded-md bg-white px-2 py-1 text-xs text-slate-600">
                        Sentiment: {source.sentiment}
                      </span>
                    )}

                    {source.rating !== null && (
                      <span className="rounded-md bg-white px-2 py-1 text-xs text-slate-600">
                        Rating: {source.rating}/5
                      </span>
                    )}

                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-700">
                    {source.text}
                  </p>

                  {source.themes &&
                    source.themes.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">

                        {source.themes.map((theme, index) => (
                          <span
                            key={`${theme}-${index}`}
                            className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                          >
                            {theme}
                          </span>
                        ))}

                      </div>
                    )}

                </div>
              ))}

            </div>
          </div>
        )}

      </div>
    </main>
  );
}