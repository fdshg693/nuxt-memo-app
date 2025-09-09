Import JSON policy — build-time bundling with import.meta.glob

目的

- Vercel 等の serverless/edge 環境では runtime での process.cwd()/fs によるファイル I/O が動作しないケースがある。
- 大量の静的 JSON はビルド時にバンドルして配布することで I/O を排し、起動/レスポンスを高速化する。

方針

- サーバーサイドの API 内で参照する静的 JSON は、ランタイム I/O（readFileSync / process.cwd() / path.join）を使わず、Vite の import.meta.glob を用いてビルド時に eager インポートする。
  - 例: const modules = import.meta.glob('../../data/sqlExplanation/*Explanation.json', { eager: true, import: 'default' })
  - これにより JSON はバンドル内に含まれ、I/O は不要。Vercel や他の serverless 環境で安全に動作する。

実装上の注意

- TypeScript 環境で import.meta.glob の型が見つからない場合は、プロジェクト内に型宣言を追加する（例: types/import-meta.d.ts）。
- パスの解決はビルド時に行われるので、glob のパターンはソースツリーに対する相対パスで指定する。
- JSON の更新が頻繁にある場合は、ビルドプロセスに反映される必要がある（ホット更新/デプロイが必要）。

SQLite と静的 JSON についての例外

- SQLite はランタイムで書き込み可能な場所が必要なため、DB ファイルは /tmp（Vercel 等の書き込み可能なディレクトリ）を利用するようにする。
- したがって、SQLite のパス決定には runtime の判定（process.env.NODE_ENV 等）を残す。これは静的 JSON の方針とは別扱い。

運用・今後の改善案

- better-sqlite3 などランタイム依存のライブラリは型定義を整備する（@types またはプロジェクト内 d.ts）。
- JSON のスキーマ検証を導入（zod など）して、読み込み時の不整合を検出する。
- 将来的に完全にサーバレス/エッジへ移行する場合は、SQLite の代替ストレージ（Turso、PlanetScale 等）を検討する。

変更履歴

- 2025-09-09: import.meta.glob を使ったビルド時インポート方針を採用。server/api/question-explanation.get.ts と server/api/explanation.get.ts を修正。
