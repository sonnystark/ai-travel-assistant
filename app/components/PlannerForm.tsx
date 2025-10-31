"use client";

import { useState } from "react";
import Card from "./Card";
import Header from "./Header";
import Button from "./ui/Button";
import Input from "./ui/Input";

export default function PlannerForm() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    modelUsed?: string;
    tokenBudget?: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPlan(null);
    setMeta(null);

    if (!prompt.trim()) {
      setError("Enter a trip idea, e.g. “3 days in Kyoto focused on food”");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) {
        setError(data?.error || "Failed to generate itinerary");
      } else {
        setPlan(Array.isArray(data.plan) ? data.plan : [String(data.plan)]);
        setMeta({ modelUsed: data.modelUsed, tokenBudget: data.tokenBudget });
      }
    } catch (err: any) {
      setError(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <Header
        title="AI Travel Planner"
        subtitle="Describe your trip idea and get a concise 3–5 point itinerary."
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {" "}
        <label htmlFor="prompt" className="sr-only">
          Trip idea
        </label>
        <Input
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='e.g. "3 days in Kyoto focused on food"'
          aria-label="Trip idea"
        />
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-6">
          {" "}
          <div className="w-full sm:w-auto">
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              {loading ? "Generating…" : "Generate"}
            </Button>
          </div>
        </div>
      </form>

      <div className="mt-8">
        {error && (
          <div className="text-sm text-red-700 bg-[rgba(220,38,38,0.06)] rounded-md p-3">
            {error}
          </div>
        )}

        {plan && (
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-3">Suggested itinerary</h2>
            <ul className="list-inside space-y-3">
              {plan.map((p, i) => (
                <li key={i} className="text-sm">
                  {p}
                </li>
              ))}
            </ul>

            {(meta?.modelUsed || meta?.tokenBudget) && (
              <div className="mt-4 text-xs text-muted">
                {meta.modelUsed && (
                  <span>
                    Model: <span className="font-medium">{meta.modelUsed}</span>
                    {meta.tokenBudget ? " · " : ""}
                  </span>
                )}
                {meta.tokenBudget && (
                  <span>
                    Budget:{" "}
                    <span className="font-medium">{meta.tokenBudget}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
