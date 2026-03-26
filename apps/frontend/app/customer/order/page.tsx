"use client";

import { ChangeEvent, FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Product = {
  productId: string;
  productName: string;
  description: string;
  price: number;
};

export type OrderFormValues = {
  customerEmail: string;
  customerPhone: string;
  deliveryDate: string;
  deliveryAddress: string;
  message: string;
};

export type OrderFormErrors = Partial<Record<keyof OrderFormValues, string>>;

const initialFormValues: OrderFormValues = {
  customerEmail: "",
  customerPhone: "",
  deliveryDate: "",
  deliveryAddress: "",
  message: "",
};

type OrderStep = "input" | "confirm" | "complete";

type OrderConfirmation = {
  orderId: string;
  status: string;
};

type DeliveryAddressHistory = {
  deliveryAddressId: string;
  recipientName: string;
  postalCode: string;
  deliveryAddress: string;
  deliveryPhoneNumber: string;
  lastUsedAt: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
const fallbackProducts: Product[] = [
  {
    productId: "rose-garden",
    productName: "ローズガーデン",
    description: "赤バラとグリーンを束ねた、記念日向けの定番ブーケです。",
    price: 5500,
  },
  {
    productId: "seasonal-mimosa",
    productName: "季節のミモザブーケ",
    description: "旬のミモザを主役にした、春の贈り物向けの花束です。",
    price: 4800,
  },
  {
    productId: "white-lily",
    productName: "ホワイトリリー",
    description: "白を基調にまとめた、上品で落ち着いたアレンジです。",
    price: 6200,
  },
];

const customerProductsFallbackMessage =
  "商品情報の取得に失敗したため、既定の商品情報を表示しています。時間をおいて再度お試しください。";

export function validateOrderForm(values: OrderFormValues): OrderFormErrors {
  const errors: OrderFormErrors = {};

  if (!values.deliveryDate.trim()) {
    errors.deliveryDate = "届け日は必須です。";
  }

  if (!values.deliveryAddress.trim()) {
    errors.deliveryAddress = "届け先は必須です。";
  }

  if (!values.message.trim()) {
    errors.message = "メッセージは必須です。";
  }

  return errors;
}

function OrderPageContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("product");
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [values, setValues] = useState<OrderFormValues>(initialFormValues);
  const [errors, setErrors] = useState<OrderFormErrors>({});
  const [step, setStep] = useState<OrderStep>("input");
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deliveryHistory, setDeliveryHistory] = useState<DeliveryAddressHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const selectedProduct = products.find((product) => product.productId === productId);
  const productName = selectedProduct?.productName ?? (productId ? "対象外の商品です" : "未選択");

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      if (active) {
        setProductsLoading(true);
        setProductsError(null);
      }

      try {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 1000);
        const response = await fetch(`${apiBaseUrl}/customer/products`, {
          signal: controller.signal,
        });
        window.clearTimeout(timeoutId);

        if (!response.ok) {
          if (active) {
            setProducts(fallbackProducts);
            setProductsError(customerProductsFallbackMessage);
            setProductsLoading(false);
          }

          return;
        }

        const data = (await response.json()) as Product[];

        if (active) {
          setProducts(data);
          setProductsError(null);
          setProductsLoading(false);
        }
      } catch {
        if (active) {
          setProducts(fallbackProducts);
          setProductsError(customerProductsFallbackMessage);
          setProductsLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateOrderForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setStep("confirm");
    }
  };

  const handleChange =
    (field: keyof OrderFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const nextValue = event.target.value;

      setValues((current) => ({
        ...current,
        [field]: nextValue,
      }));
    };

  const handleBack = () => {
    setStep("input");
    setSubmitError(null);
  };

  const handleReuseDeliveryAddress = async () => {
    if (!values.customerEmail.trim() || !values.customerPhone.trim()) {
      setHistoryError("注文者メールと電話番号を入力してから履歴を呼び出してください。");
      setDeliveryHistory([]);
      return;
    }

    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const query = new URLSearchParams({
        customerEmail: values.customerEmail,
        customerPhone: values.customerPhone,
      });
      const response = await fetch(`${apiBaseUrl}/customer/delivery-addresses?${query.toString()}`);

      if (!response.ok) {
        setHistoryError("届け先履歴の取得に失敗しました。時間をおいて再度お試しください。");
        setDeliveryHistory([]);
        setHistoryLoading(false);
        return;
      }

      const payload = (await response.json()) as DeliveryAddressHistory[];
      setDeliveryHistory(payload);
      setHistoryError(payload.length === 0 ? "利用できる届け先履歴がありません。新規入力を続けてください。" : null);
      setHistoryLoading(false);
    } catch {
      setHistoryError("届け先履歴の取得に失敗しました。時間をおいて再度お試しください。");
      setDeliveryHistory([]);
      setHistoryLoading(false);
    }
  };

  const handleSelectDeliveryAddress = (history: DeliveryAddressHistory) => {
    setValues((current) => ({
      ...current,
      deliveryAddress: history.deliveryAddress,
    }));
    setHistoryError(null);
    setDeliveryHistory([]);
  };

  const handleConfirm = async () => {
    setSubmitError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/customer/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          productName,
          ...values,
        }),
      });

      if (!response.ok) {
        setSubmitError("注文の確定に失敗しました。時間をおいて再度お試しください。");
        return;
      }

      const payload = (await response.json()) as OrderConfirmation;
      setConfirmation(payload);
      setStep("complete");
    } catch {
      setSubmitError("注文の確定に失敗しました。時間をおいて再度お試しください。");
    }
  };

  if (step === "confirm") {
    return (
      <main>
        <div className="shell">
          <section className="hero">
            <span className="badge">Order Confirmation</span>
            <h1>注文確認</h1>
            <p>入力内容を確認し、問題なければ注文を確定してください。</p>
          </section>

          <section className="order-summary" aria-label="注文内容の確認">
            <h2>注文内容の確認</h2>
            <dl>
              <dt>商品</dt>
              <dd>{productName}</dd>
              <dt>届け日</dt>
              <dd>{values.deliveryDate}</dd>
              <dt>届け先</dt>
              <dd>{values.deliveryAddress}</dd>
              <dt>メッセージ</dt>
              <dd>{values.message}</dd>
            </dl>
            {submitError ? (
              <p className="field-error" role="alert">
                {submitError}
              </p>
            ) : null}
            <div className="action-row">
              <button className="secondary-button" type="button" onClick={handleBack}>
                入力画面に戻る
              </button>
              <button className="primary-button" type="button" onClick={() => void handleConfirm()}>
                注文を確定する
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (step === "complete") {
    return (
      <main>
        <div className="shell">
          <section className="hero">
            <span className="badge">Order Complete</span>
            <h1>注文が完了しました</h1>
            <p>ご注文ありがとうございます。スタッフが内容を確認し、対応を進めます。</p>
          </section>

          <section className="order-summary" aria-label="注文完了">
            <h2>受付内容</h2>
            <p>注文番号: {confirmation?.orderId ?? "未採番"}</p>
            <p>商品: {productName}</p>
            <p>届け日: {values.deliveryDate}</p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="shell">
        <section className="hero">
          <span className="badge">Order Form</span>
          <h1>注文入力</h1>
          <p>選択した花束を確認し、届け日、届け先、メッセージを入力してください。</p>
        </section>

        <section className="order-summary" aria-label="注文入力サマリー">
          <h2>選択中の商品</h2>
          {productsLoading ? <p>商品情報を読み込んでいます。</p> : null}
          {!productsLoading && productsError ? (
            <div className="admin-feedback admin-feedback--error">
              <p>{productsError}</p>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setReloadKey((current) => current + 1)}
              >
                再試行
              </button>
            </div>
          ) : null}
          <p className="order-product-name">{productName}</p>
          <p>内容を入力後、確認画面へ進む前に必須項目の不足をこの画面で確認できます。</p>
        </section>

        <section className="order-form-section" aria-label="注文入力フォーム">
          <form className="order-form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="customer-email">注文者メール</label>
              <input
                id="customer-email"
                name="customerEmail"
                type="email"
                value={values.customerEmail}
                onChange={handleChange("customerEmail")}
                placeholder="hanako@example.com"
              />
            </div>

            <div className="field">
              <label htmlFor="customer-phone">注文者電話番号</label>
              <input
                id="customer-phone"
                name="customerPhone"
                type="tel"
                value={values.customerPhone}
                onChange={handleChange("customerPhone")}
                placeholder="090-1111-2222"
              />
              <p className="field-hint">過去の届け先を呼び出すときに使います。</p>
            </div>

            <div className="field">
              <button
                className="secondary-button"
                type="button"
                onClick={() => void handleReuseDeliveryAddress()}
              >
                届け先を再利用する
              </button>
              {historyLoading ? <p>届け先履歴を読み込んでいます。</p> : null}
              {historyError ? (
                <p className="field-error" role="alert">
                  {historyError}
                </p>
              ) : null}
              {deliveryHistory.length > 0 ? (
                <div className="order-history-list" aria-label="過去の届け先">
                  {deliveryHistory.map((history) => (
                    <article key={history.deliveryAddressId} className="order-history-card">
                      <p>{history.recipientName}</p>
                      <p>{history.deliveryAddress}</p>
                      <p>最終利用日: {history.lastUsedAt}</p>
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => handleSelectDeliveryAddress(history)}
                      >
                        この届け先を使う
                      </button>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="delivery-date">届け日</label>
              <input
                id="delivery-date"
                name="deliveryDate"
                type="date"
                value={values.deliveryDate}
                onChange={handleChange("deliveryDate")}
                aria-describedby={errors.deliveryDate ? "delivery-date-error" : undefined}
              />
              {errors.deliveryDate ? (
                <p className="field-error" id="delivery-date-error" role="alert">
                  {errors.deliveryDate}
                </p>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="delivery-address">届け先</label>
              <input
                id="delivery-address"
                name="deliveryAddress"
                type="text"
                value={values.deliveryAddress}
                onChange={handleChange("deliveryAddress")}
                placeholder="東京都港区南青山 1-2-3"
                aria-describedby={
                  errors.deliveryAddress ? "delivery-address-error" : undefined
                }
              />
              {errors.deliveryAddress ? (
                <p className="field-error" id="delivery-address-error" role="alert">
                  {errors.deliveryAddress}
                </p>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="message">メッセージ</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={values.message}
                onChange={handleChange("message")}
                placeholder="開店祝いのメッセージを添えてください。"
                aria-describedby={errors.message ? "message-error" : undefined}
              />
              {errors.message ? (
                <p className="field-error" id="message-error" role="alert">
                  {errors.message}
                </p>
              ) : null}
            </div>

            <button className="primary-button" type="submit">
              入力内容を確認する
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <main>
          <div className="shell">
            <p>注文画面を読み込んでいます。</p>
          </div>
        </main>
      }
    >
      <OrderPageContent />
    </Suspense>
  );
}
