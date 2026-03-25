"""注文フォーム。"""

from datetime import date, timedelta

from django import forms

_INPUT_CSS = (
    "w-full border rounded-lg p-2"
    " focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:outline-none"
)


class OrderForm(forms.Form):
    """注文入力フォーム。

    フィールド順序は UI 設計書 C-05 に準拠:
    1. 届け日 → 2. 届け先 → 3. メッセージカード → 4. 数量
    """

    # 1. 届け日
    delivery_date = forms.DateField(
        label="届け日",
        widget=forms.DateInput(attrs={"type": "date", "class": _INPUT_CSS}),
    )

    # 2. 届け先
    recipient_name = forms.CharField(
        label="届け先氏名",
        max_length=100,
        widget=forms.TextInput(attrs={"class": _INPUT_CSS}),
    )
    postal_code = forms.CharField(
        label="郵便番号",
        max_length=10,
        widget=forms.TextInput(attrs={"class": _INPUT_CSS, "placeholder": "100-0001"}),
    )
    address = forms.CharField(
        label="届け先住所",
        max_length=300,
        widget=forms.TextInput(attrs={"class": _INPUT_CSS}),
    )
    phone = forms.CharField(
        label="電話番号",
        max_length=20,
        widget=forms.TextInput(
            attrs={"class": _INPUT_CSS, "placeholder": "03-1234-5678"}
        ),
    )

    # 3. メッセージカード
    message = forms.CharField(
        label="メッセージカード",
        max_length=200,
        required=False,
        widget=forms.Textarea(
            attrs={
                "class": _INPUT_CSS,
                "rows": 3,
                "placeholder": "200文字以内",
            }
        ),
    )

    # 4. 数量
    quantity = forms.IntegerField(
        label="数量",
        min_value=1,
        initial=1,
        widget=forms.NumberInput(
            attrs={
                "class": (
                    "w-20 border rounded-lg p-2"
                    " focus:ring-2 focus:ring-pink-500"
                    " focus:border-pink-500 focus:outline-none"
                ),
            }
        ),
    )

    def clean_delivery_date(self):
        value = self.cleaned_data["delivery_date"]
        tomorrow = date.today() + timedelta(days=1)
        if value < tomorrow:
            raise forms.ValidationError("届け日は翌日以降を指定してください")
        return value
