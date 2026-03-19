"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";

const productNames = {
  "rose-garden": "ローズガーデン",
  "seasonal-mimosa": "季節のミモザブーケ",
  "white-memories": "ホワイトメモリーズ",
} as const;

type ProductId = keyof typeof productNames;

export type OrderFormValues = {
  deliveryDate: string;
  deliveryAddress: string;
  message: string;
};

export type OrderFormErrors = Partial<Record<keyof OrderFormValues, string>>;

const initialFormValues: OrderFormValues = {
  deliveryDate: "",
  deliveryAddress: "",
  message: "",
};

function resolveProductName(productId?: string | null) {
  if (!productId) {
    return "未選択";
  }

  if (productId in productNames) {
    return productNames[productId as ProductId];
  }

  return "対象外の商品です";
}

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

export default function OrderPage() {
  const searchParams = useSearchParams();
  const productName = resolveProductName(searchParams.get("product"));
  const [values, setValues] = useState<OrderFormValues>(initialFormValues);
  const [errors, setErrors] = useState<OrderFormErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors(validateOrderForm(values));
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
          <p className="order-product-name">{productName}</p>
          <p>内容を入力後、確認画面へ進む前に必須項目の不足をこの画面で確認できます。</p>
        </section>

        <section className="order-form-section" aria-label="注文入力フォーム">
          <form className="order-form" onSubmit={handleSubmit} noValidate>
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
