"""
Email service for Leevin APP Management System.
Uses Resend API for reliable transactional email delivery.

Required env vars:
  RESEND_API_KEY – API key from resend.com
  EMAIL_SENDER   – e.g. support@leevin.app (domain must be verified on Resend)
"""

import os
import base64
import httpx
from typing import Optional


RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
EMAIL_SENDER = os.getenv("EMAIL_SENDER", "support@leevin.app")
# Keep EMAIL_PASSWORD for backward compat check
EMAIL_PASSWORD = RESEND_API_KEY  # alias so contracts.py check still works


def send_email(
    to: str,
    subject: str,
    html_body: str,
    attachment_bytes: Optional[bytes] = None,
    attachment_filename: Optional[str] = None,
    cc: Optional[str] = None,
) -> dict:
    """
    Send an email via Resend API.
    Returns {"success": True} or {"success": False, "error": "..."}.
    """
    if not RESEND_API_KEY:
        return {"success": False, "error": "RESEND_API_KEY not configured on server"}

    try:
        payload: dict = {
            "from": f"Leevin APP <{EMAIL_SENDER}>",
            "to": [to],
            "subject": subject,
            "html": html_body,
        }

        if cc:
            payload["cc"] = [cc]

        # Attach file if provided
        if attachment_bytes and attachment_filename:
            b64_content = base64.b64encode(attachment_bytes).decode("utf-8")
            payload["attachments"] = [
                {
                    "filename": attachment_filename,
                    "content": b64_content,
                }
            ]

        response = httpx.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=30,
        )

        if response.status_code in (200, 201):
            data = response.json()
            return {"success": True, "id": data.get("id")}
        else:
            error_data = response.json() if response.headers.get("content-type", "").startswith("application/json") else {"message": response.text}
            return {
                "success": False,
                "error": error_data.get("message", f"Resend API error {response.status_code}"),
            }

    except httpx.TimeoutException:
        return {"success": False, "error": "Timeout connecting to Resend API"}
    except Exception as e:
        return {"success": False, "error": str(e)}
