"""
Email service for Leevin APP Management System.
Supports Gmail SMTP (primary) and Resend API (fallback).

Required env vars for Gmail SMTP:
  SMTP_USER     – Gmail/Workspace email (e.g. support@leevin.app)
  SMTP_PASSWORD – App Password from Google (16 chars, no spaces)

Optional env vars for Resend fallback:
  RESEND_API_KEY – API key from resend.com
  EMAIL_SENDER   – verified sender domain email
"""

import os
import ssl
import base64
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import Optional

# Gmail SMTP config
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

# Resend fallback
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
EMAIL_SENDER = os.getenv("EMAIL_SENDER", "support@leevin.app")

# Backward compat alias
EMAIL_PASSWORD = SMTP_PASSWORD or RESEND_API_KEY


def send_email(
    to: str,
    subject: str,
    html_body: str,
    attachment_bytes: Optional[bytes] = None,
    attachment_filename: Optional[str] = None,
    cc: Optional[str] = None,
) -> dict:
    """
    Send an email. Tries Gmail SMTP first, falls back to Resend API.
    Returns {"success": True} or {"success": False, "error": "..."}.
    """
    if SMTP_USER and SMTP_PASSWORD:
        return _send_via_smtp(to, subject, html_body, attachment_bytes, attachment_filename, cc)

    if RESEND_API_KEY:
        return _send_via_resend(to, subject, html_body, attachment_bytes, attachment_filename, cc)

    return {"success": False, "error": "Email nao configurado. Defina SMTP_USER + SMTP_PASSWORD ou RESEND_API_KEY nas variaveis de ambiente."}


def _send_via_smtp(
    to: str,
    subject: str,
    html_body: str,
    attachment_bytes: Optional[bytes] = None,
    attachment_filename: Optional[str] = None,
    cc: Optional[str] = None,
) -> dict:
    """Send email via Gmail SMTP with SSL."""
    try:
        msg = MIMEMultipart("mixed")
        msg["From"] = f"Leevin APP <{SMTP_USER}>"
        msg["To"] = to
        msg["Subject"] = subject
        if cc:
            msg["Cc"] = cc

        msg.attach(MIMEText(html_body, "html", "utf-8"))

        if attachment_bytes and attachment_filename:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(attachment_bytes)
            encoders.encode_base64(part)
            part.add_header("Content-Disposition", f"attachment; filename={attachment_filename}")
            msg.attach(part)

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=context, timeout=30) as server:
            server.login(SMTP_USER, SMTP_PASSWORD)
            recipients = [to]
            if cc:
                recipients.append(cc)
            server.sendmail(SMTP_USER, recipients, msg.as_string())

        return {"success": True}

    except smtplib.SMTPAuthenticationError as e:
        return {"success": False, "error": f"Erro de autenticacao SMTP. Verifique email e senha de app. ({str(e)})"}
    except smtplib.SMTPException as e:
        return {"success": False, "error": f"Erro SMTP: {str(e)}"}
    except Exception as e:
        return {"success": False, "error": f"Erro ao enviar email: {str(e)}"}


def _send_via_resend(
    to: str,
    subject: str,
    html_body: str,
    attachment_bytes: Optional[bytes] = None,
    attachment_filename: Optional[str] = None,
    cc: Optional[str] = None,
) -> dict:
    """Send email via Resend API (fallback)."""
    try:
        import httpx

        payload: dict = {
            "from": f"Leevin APP <{EMAIL_SENDER}>",
            "to": [to],
            "subject": subject,
            "html": html_body,
        }

        if cc:
            payload["cc"] = [cc]

        if attachment_bytes and attachment_filename:
            b64_content = base64.b64encode(attachment_bytes).decode("utf-8")
            payload["attachments"] = [{"filename": attachment_filename, "content": b64_content}]

        response = httpx.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
            json=payload,
            timeout=30,
        )

        if response.status_code in (200, 201):
            return {"success": True, "id": response.json().get("id")}
        else:
            return {"success": False, "error": f"Resend API error {response.status_code}: {response.text}"}

    except Exception as e:
        return {"success": False, "error": str(e)}
