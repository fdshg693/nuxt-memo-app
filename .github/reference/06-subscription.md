# サブスクリプション & 決済

## Stripe 連携
`/server/api/stripe/` 配下:
- `create-checkout-session.post.ts`
- `subscription-status.get.ts`
- `webhook.post.ts`

## プラン
Basic / Pro / Enterprise

## アクセス制御
- Middleware でプレミアム機能判定
- サブスク状態により機能制限

## テーブル (ローカル管理型)
`subscriptions (user_id, stripe_subscription_id, status, plan_name, timestamps)`

## 環境変数
`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
