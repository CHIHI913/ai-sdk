"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";

export const JobSummaryCompetencySchema = z.object({
  jobSummary: z.string(),
  competency: z.string(),
});
export type JobSummaryCompetency = z.infer<typeof JobSummaryCompetencySchema>;

export const OptionDataSchema = z.object({
  options: z.array(z.string().optional()),
});
export type OptionData = z.infer<typeof OptionDataSchema>;

export default function Page() {
  const {
    object: jobSummaryCompetencyObject,
    submit: handleSubmit,
    isLoading,
  } = useObject<JobSummaryCompetency>({
    api: "http://localhost:3100/api/v1/gpt",
    schema: JobSummaryCompetencySchema,
    onFinish: (event) => {
      setEditableJobSummary(event.object?.jobSummary || "");
      setEditableCompetency(event.object?.competency || "");
    },
  });

  // useObjectでAPIと連携
  const {
    object: optionObject,
    submit: handleOptionSubmit,
    isLoading: optionLoading,
  } = useObject<OptionData>({
    api: "http://localhost:3100/api/v1/gpt/option",
    schema: OptionDataSchema,
  });

  // チップとして表示するオプション（ストリーミング中のデータをそのまま使用）
  const chipCandidates =
    optionObject?.options?.filter((opt): opt is string => Boolean(opt)) || [];

  // オプション入力用の状態
  const [optionInput, setOptionInput] = useState("職種");

  // ユーザー編集用のstate
  const [editableJobSummary, setEditableJobSummary] = useState("");
  const [editableCompetency, setEditableCompetency] = useState("");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 p-2">
        <div className="flex flex-row gap-2">
          <div className="w-24 text-zinc-500">AI:</div>
          <div className="w-full relative">
            <TextareaAutosize
              className="p-2 bg-zinc-100 text-black resize-none"
              style={{ width: "1000px" }}
              minRows={3}
              value={
                isLoading
                  ? jobSummaryCompetencyObject?.jobSummary ?? ""
                  : editableJobSummary
              }
              onChange={(e) => setEditableJobSummary(e.target.value)}
            />
            {isLoading && !jobSummaryCompetencyObject?.jobSummary && (
              <div
                className="absolute left-0 top-0 w-full flex items-center justify-center pointer-events-none"
                style={{ height: 72, background: "rgba(244,244,245,0.7)" }}
              >
                <div className="w-3/4 h-6 bg-zinc-300 animate-pulse rounded" />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <div className="w-24 text-zinc-500">AI:</div>
          <div className="w-full relative">
            <TextareaAutosize
              className="p-2 bg-zinc-100 text-black resize-none"
              style={{ width: "1000px" }}
              minRows={3}
              value={
                isLoading
                  ? jobSummaryCompetencyObject?.competency ?? ""
                  : editableCompetency
              }
              onChange={(e) => setEditableCompetency(e.target.value)}
            />
            {isLoading && !jobSummaryCompetencyObject?.competency && (
              <div
                className="absolute left-0 top-0 w-full flex items-center justify-center pointer-events-none"
                style={{ height: 72, background: "rgba(244,244,245,0.7)" }}
              >
                <div className="w-3/4 h-6 bg-zinc-300 animate-pulse rounded" />
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="fixed bottom-0 w-full p-2">
        {/* チップUI */}
        <div className="flex gap-2 mb-2">
          {chipCandidates.map((candidate) => (
            <button
              key={candidate}
              type="button"
              className={`px-3 py-1 rounded-full ${
                optionLoading
                  ? "bg-blue-100 text-blue-700 animate-pulse"
                  : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
              } border border-zinc-300 transition`}
              onClick={() => {
                // チップをクリックした際にAPIへ送信
                handleSubmit({ prompt: candidate });
              }}
            >
              {candidate}
            </button>
          ))}
        </div>
      </form>
      {/* オプション取得用フォーム */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleOptionSubmit({ prompt: optionInput });
        }}
        style={{ margin: "16px 0" }}
      >
        <div className="flex gap-2 items-center">
          <input
            value={optionInput}
            placeholder="オプションを入力..."
            onChange={(e) => setOptionInput(e.target.value)}
            className="p-2 bg-zinc-100 text-black"
            disabled={optionLoading}
          />
          <button
            type="submit"
            disabled={optionLoading}
            className="px-3 py-1 rounded bg-zinc-200 text-zinc-700 hover:bg-zinc-300 border border-zinc-300 transition"
          >
            オプションを取得
          </button>
        </div>
      </form>
    </div>
  );
}
