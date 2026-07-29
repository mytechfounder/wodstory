(function () {
  "use strict";

  document.querySelectorAll("[data-newsletter-form]").forEach(function (form) {
    var status = form.querySelector("[data-newsletter-status]");
    var submit = form.querySelector('button[type="submit"]');
    var email = form.elements.email;
    var consent = form.elements.consent;
    var website = form.elements.website;

    function show(message, kind) {
      status.textContent = message;
      status.className = "wod-newsletter-status" + (kind ? " is-" + kind : "");
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      show("", "");

      if (!email.checkValidity()) {
        email.focus();
        show("Συμπλήρωσε μια έγκυρη διεύθυνση email.", "error");
        return;
      }
      if (!consent.checked) {
        consent.focus();
        show("Χρειάζεται να αποδεχτείς τους όρους του newsletter.", "error");
        return;
      }

      submit.disabled = true;
      submit.setAttribute("aria-busy", "true");
      show("Ολοκληρώνουμε την εγγραφή σου…", "");

      try {
        var response = await fetch(form.dataset.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.value, consent: consent.checked, website: website.value })
        });
        var result = await response.json().catch(function () { return {}; });
        if (!response.ok || !result.ok) throw new Error(result.message || "Η εγγραφή δεν ολοκληρώθηκε.");

        form.reset();
        show("Η εγγραφή ολοκληρώθηκε. Καλώς ήρθες στον Κόσμο των Νάνων!", "success");
      } catch (error) {
        show(error && error.message ? error.message : "Κάτι πήγε στραβά. Δοκίμασε ξανά σε λίγο.", "error");
      } finally {
        submit.disabled = false;
        submit.removeAttribute("aria-busy");
      }
    });
  });
})();
