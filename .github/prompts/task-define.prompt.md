---
mode: agent
---
`.github/user/task.md`に書いてあるユーザーの要求を元に、`.github/output/task-define.md`を作成してください。


## 実行ステップ
1. `.github/user/task.md`を読み込み、ユーザーの要求を理解する。
    - ユーザーの要求に応えるために必要な情報を調べて、結果を`.github/task-define/search.md`に保存する。
2. ユーザーの要求に応えるために必要な情報を整理して、`.github/task-define/define.md`に保存する。
3. `.github/task-define/define.md`を元に、`.github/output/task-define.md`を作成する。

## 注意点
**常に**、不明点・曖昧な点が発生したら`.github/task-define/user-questions.md`に書いてください。
**毎回の実行時に**、`.github/task-define/progress-{number}.md`が存在すれば{number}が最大のものを参照して、前回の実行結果を引き継いでください。
**毎回の実行時に**、`.github/task-define/user-answers.md`が存在すれば、そのユーザーの記載内容を考慮して実行してください。
**1ステップ**を完了したら、`.github/task-define/progress-{number}.md`に進捗を保存して、実行を終了してください。