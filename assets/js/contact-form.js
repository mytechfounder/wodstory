(() => {
  "use strict";

  const form = document.querySelector("[data-contact-form]");
  if (!(form instanceof HTMLFormElement)) return;

  const endpoint = form.dataset.endpoint;
  const status = form.querySelector("[data-contact-status]");
  const submit = form.querySelector('button[type="submit"]');
  const message = form.elements.namedItem("message");
  const counter = form.querySelector("[data-contact-count]");

  const updateCounter = () => {
    if (message instanceof HTMLTextAreaElement && counter) counter.textContent = `${message.value.length.toLocaleString("el-GR")}/5.000`;
  };
  message?.addEventListener("input", updateCounter);

  const showStatus = (text, type) => {
    if (!status) return;
    status.textContent = text;
    status.className = `contact-status ${type ? `is-${type}` : ""}`.trim();
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    showStatus("", "");

    if (!form.reportValidity() || !endpoint) return;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      subject: String(data.get("subject") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      consent: data.get("consent") === "on",
      website: String(data.get("website") ?? ""),
    };

    if (payload.name.length < 2 || payload.subject.length < 3 || payload.message.length < 10) {
      showStatus("Συμπλήρωσε όλα τα πεδία με περισσότερες πληροφορίες.", "error");
      return;
    }

    if (submit instanceof HTMLButtonElement) submit.disabled = true;
    showStatus("Αποστολή μηνύματος…", "");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) throw new Error(result?.message || "Το μήνυμα δεν στάλθηκε.");
      form.reset();
      updateCounter();
      showStatus(result.message || "Το μήνυμά σου στάλθηκε επιτυχώς.", "success");
    } catch (error) {
      showStatus(error instanceof Error ? error.message : "Παρουσιάστηκε προσωρινό πρόβλημα. Δοκίμασε ξανά.", "error");
    } finally {
      if (submit instanceof HTMLButtonElement) submit.disabled = false;
    }
  });
})();
