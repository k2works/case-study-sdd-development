"""注文フォーム。"""

from datetime import date, timedelta

from django import forms


class OrderForm(forms.Form):
    """注文入力フォーム。"""

    recipient_name = forms.CharField(
        label="届け先氏名",
        max_length=100,
        widget=forms.TextInput(attrs={"class": "w-full border rounded p-2"}),
    )
    postal_code = forms.CharField(
        label="郵便番号",
        max_length=10,
        widget=forms.TextInput(
            attrs={"class": "w-full border rounded p-2", "placeholder": "100-0001"}
        ),
    )
    address = forms.CharField(
        label="届け先住所",
        max_length=300,
        widget=forms.TextInput(attrs={"class": "w-full border rounded p-2"}),
    )
    phone = forms.CharField(
        label="電話番号",
        max_length=20,
        widget=forms.TextInput(
            attrs={"class": "w-full border rounded p-2", "placeholder": "03-1234-5678"}
        ),
    )
    delivery_date = forms.DateField(
        label="届け日",
        widget=forms.DateInput(
            attrs={"type": "date", "class": "w-full border rounded p-2"}
        ),
    )
    message = forms.CharField(
        label="メッセージカード",
        max_length=200,
        required=False,
        widget=forms.Textarea(
            attrs={
                "class": "w-full border rounded p-2",
                "rows": 3,
                "placeholder": "200文字以内",
            }
        ),
    )
    quantity = forms.IntegerField(
        label="数量",
        min_value=1,
        initial=1,
        widget=forms.NumberInput(attrs={"class": "w-20 border rounded p-2"}),
    )

    def clean_delivery_date(self):
        value = self.cleaned_data["delivery_date"]
        tomorrow = date.today() + timedelta(days=1)
        if value < tomorrow:
            raise forms.ValidationError("届け日は翌日以降を指定してください")
        return value
