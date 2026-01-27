import React from 'react';

export default function Privacy() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 text-gray-700 leading-relaxed">
      <h1 className="text-3xl font-bold text-gray-900 border-b pb-4">プライバシーポリシー</h1>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">データ処理について</h2>
        <p>
          Soku-p（以下「当サービス」）では、WebAssembly技術を使用し、すべての画像変換処理をお客様のブラウザ内（クライアントサイド）で行っております。
          <strong className="text-gray-900">サーバーへ画像をアップロードすることは一切ありません。</strong>
          したがって、お客様の画像データが第三者に閲覧されたり、外部サーバーに保存されたりすることはありませんので、安心してご利用いただけます。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">アクセス解析ツールについて</h2>
        <p>
          当サービスでは、サービスの品質向上のため、アクセス解析ツール（Google Analytics等）を利用する場合があります。
          これらはトラフィックデータの収集のためにCookieを使用します。このトラフィックデータは匿名で収集されており、個人を特定するものではありません。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">免責事項</h2>
        <p>
          当サービスは無料で提供されており、予告なくサービス内容の変更や中断を行う場合があります。
          当サービスのご利用により生じたいかなる損害につきましても、運営者は一切の責任を負いかねますので、あらかじめご了承ください。
        </p>
      </section>
    </div>
  );
}
