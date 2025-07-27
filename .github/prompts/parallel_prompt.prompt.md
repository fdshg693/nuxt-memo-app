---
mode: agent
---

## 参照ファイル
以下のファイルを参照してください。
`.github/output/task-define.md`に今回取り組むべきタスクが定義されています。
`.github/task-exec/subtasks.md`には各タスクの詳細な実行手順が記載されています。
`.github/prompts/parallel_prompt.md`は、並列実行のためのプロンプトです。

## 並列実行のためのプロンプト作成
Developer A~Dの四人のAIエージェントに対して、`.github/prompts/parallel_prompt.md`に記載されている`#### Day 1-2: 設計・準備`を行わせます。
各AIエージェントに与えるプロンプトを。`.github/parallel/developer_a.md`から`.github/parallel/developer_d.md`までのファイルに記載してください。

## 出力ファイル
`.github/parallel/developer_a.md`
`.github/parallel/developer_b.md`
`.github/parallel/developer_c.md`
`.github/parallel/developer_d.md`