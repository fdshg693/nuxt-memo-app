(このディレクトリ配下の API エンドポイントとサブディレクトリの簡潔な説明を記載します。)

- `admin/` - 管理者用の API エンドポイントを格納するサブディレクトリ。
- `explanation.get.ts` - 質問の説明（解説）を取得する GET エンドポイント。
- `generate-question.post.ts` - 新しい SQL 問題を生成する POST エンドポイント。
- `login.post.ts` - ユーザーのログイン処理を行う POST エンドポイント（セッション発行）。
- `logout.post.ts` - ユーザーのログアウト処理を行う POST エンドポイント（セッション破棄）。
- `me.get.ts` - 認証済みユーザー情報を返す GET エンドポイント。
- `openai.post.ts` - OpenAI（AI）に関連するリクエストを仲介する POST エンドポイント。
- `question-explanation.get.ts` - 単一問題の詳細な解説を取得する GET エンドポイント。
- `register.post.ts` - 新規ユーザー登録を行う POST エンドポイント。
- `stripe/` - Stripe に関する決済／サブスクリプション用のサブディレクトリ。
- `user/` - ユーザー関連の追加エンドポイント（プロフィール更新など）をまとめたサブディレクトリ。

備考:
- 各ファイルは Nuxt の server/api 形式でエクスポートされるハンドラ（GET/POST）です。
- サブディレクトリ内の詳細なエンドポイントは、それぞれのフォルダを参照してください。

admin/ の主なファイル:

- `admin/users/` - 管理者がユーザー情報を操作するエンドポイント群を格納するサブディレクトリ。

stripe/ の主なファイル:

- `create-checkout-session.post.ts` - Stripe のチェックアウトセッションを作成する POST エンドポイント。
- `subscription-status.get.ts` - ユーザーのサブスクリプション状態を取得する GET エンドポイント。
- `webhook.post.ts` - Stripe からの webhook を受け取る POST エンドポイント（イベント処理）。

user/ の主なファイル:

- `progress.get.ts` - ユーザーの学習進捗を取得する GET エンドポイント。
- `progress.post.ts` - ユーザーの学習進捗を更新する POST エンドポイント。
- `reset.post.ts` - ユーザーの進捗リセットを行う POST エンドポイント（データ削除や初期化）。


