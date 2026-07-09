# Email templates

These `brevo/*.html` files are **reference copies** of the transactional email
templates. The source of truth is the **Brevo dashboard** — live sends reference
the templates by their Brevo **template ID** (see `libs/adapters/brevo/templates/**`),
not these files. The backend does not render these HTML files at runtime.

Keep them in sync manually when the dashboard templates change; they exist so the
markup is reviewable in version control.

(The pre-migration `sendgrid/` copies were removed — the email provider is Brevo.)
