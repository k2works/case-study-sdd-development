import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  copy(event) {
    const selected = event.target.selectedOptions[0]
    if (!selected || !selected.value) return

    document.getElementById("order_recipient_name").value = selected.dataset.recipientName || ""
    document.getElementById("order_address").value = selected.dataset.address || ""
    document.getElementById("order_phone").value = selected.dataset.phone || ""
  }
}
