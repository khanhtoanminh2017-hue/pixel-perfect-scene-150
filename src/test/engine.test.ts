import { describe, expect, it } from "vitest";
import { buildQueue, checkAnswer, initTeam, rankFor, teamReducer, fiftyFifty } from "@/game/engine";
import { lesson } from "@/game/lessons/nguvan6-bai4";

const bank = lesson.questions;

describe("question bank", () => {
  it("has 8 questions per station, 40 total", () => {
    expect(bank.length).toBe(40);
    for (let s = 0; s < 5; s++) expect(bank.filter((q) => q.station === s).length).toBe(8);
  });
  it("every mcq answer index is valid", () => {
    for (const q of bank) if (q.type === "mcq") expect(q.options[q.answer]).toBeDefined();
  });
});

describe("solo", () => {
  it("builds 20 questions: 4 per station", () => {
    expect(buildQueue(bank, [0, 1, 2, 3, 4], 4).length).toBe(20);
  });
  it("ranks by score bands", () => {
    expect(rankFor(180, 200).title).toBe("Nhà khám phá xuất sắc");
    expect(rankFor(170, 200).title).toBe("Người gìn giữ ký ức");
    expect(rankFor(100, 200).title).toBe("Người khám phá triển vọng");
    expect(rankFor(90, 200).title).toBe("Hãy tiếp tục hành trình");
  });
  it("checks order answers", () => {
    const q = bank.find((x) => x.id === "l4")!;
    expect(checkAnswer(q, ["Đường", "vô", "xứ", "Huế", "quanh", "quanh"])).toBe(true);
    expect(checkAnswer(q, ["vô", "Đường", "xứ", "Huế", "quanh", "quanh"])).toBe(false);
  });
  it("50/50 removes two wrong options only", () => {
    const q = bank.find((x) => x.type === "mcq")!;
    const r = fiftyFifty(q);
    expect(r.length).toBe(2);
    if (q.type === "mcq") expect(r).not.toContain(q.answer);
  });
});

describe("team match", () => {
  const queue = buildQueue(bank, [0], 4);
  const tie = bank.filter((q) => q.station === 4).slice(0, 2);

  it("gives 10 points once even if answer is pressed twice", () => {
    let s = initTeam(["A", "B"], queue, tie);
    s = teamReducer(s, { type: "answer", correct: true });
    s = teamReducer(s, { type: "answer", correct: true });
    expect(s.teams[0].score).toBe(10);
    expect(s.teams[0].pos).toBe(1);
  });
  it("alternates turns", () => {
    let s = initTeam(["A", "B"], queue, tie);
    expect(s.turn).toBe(0);
    s = teamReducer(teamReducer(s, { type: "answer", correct: false }), { type: "next" });
    expect(s.turn).toBe(1);
    expect(s.teams[0].score).toBe(0);
  });
  it("each lifeline works once per match", () => {
    let s = initTeam(["A", "B"], queue, tie);
    s = teamReducer(s, { type: "time" });
    expect(s.teams[0].time).toBe(false);
    const again = teamReducer(s, { type: "time" });
    expect(again).toBe(s);
  });
  it("declares winner, or goes to tie-break on equal score", () => {
    let s = initTeam(["A", "B"], queue, tie);
    for (let i = 0; i < 4; i++) s = teamReducer(teamReducer(s, { type: "answer", correct: i === 0 }), { type: "next" });
    expect(s.phase).toBe("done");
    expect(s.winner).toBe(0);

    let t = initTeam(["A", "B"], queue, tie);
    for (let i = 0; i < 4; i++) t = teamReducer(teamReducer(t, { type: "answer", correct: true }), { type: "next" });
    expect(t.phase).toBe("tiebreak");
    t = teamReducer(teamReducer(t, { type: "answer", correct: false }), { type: "next" });
    t = teamReducer(teamReducer(t, { type: "answer", correct: true }), { type: "next" });
    expect(t.winner).toBe(1);
  });
});
