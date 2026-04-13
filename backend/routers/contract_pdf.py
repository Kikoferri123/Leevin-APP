from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Contract, Client, Property, User
from auth import get_current_user
from pydantic import BaseModel
from typing import Optional
import io, os, smtplib, uuid, base64 as b64, httpx
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

router = APIRouter(prefix="/contracts", tags=["Contract PDF"])
public_router = APIRouter(prefix="/public/contract", tags=["Public Contract Signing"])


class EmailRequest(BaseModel):
    to_email: str
    subject: Optional[str] = "Leevin APP - Licence Agreement"
    message: Optional[str] = None


def _generate_contract_pdf(contract, client, prop, db) -> io.BytesIO:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import mm, cm
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak, Image
    from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
    import base64

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm, leftMargin=2.5*cm, rightMargin=2.5*cm)
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle('ContractTitle', parent=styles['Title'], fontSize=16, textColor=colors.HexColor('#1e3a5f'), spaceAfter=6)
    heading_style = ParagraphStyle('ContractHeading', parent=styles['Heading2'], fontSize=11, textColor=colors.HexColor('#1e3a5f'), spaceBefore=12, spaceAfter=6)
    body_style = ParagraphStyle('ContractBody', parent=styles['Normal'], fontSize=9, leading=13, alignment=TA_JUSTIFY, spaceAfter=6)
    bold_style = ParagraphStyle('ContractBold', parent=body_style, fontName='Helvetica-Bold')
    small_style = ParagraphStyle('ContractSmall', parent=body_style, fontSize=8, leading=11)
    center_style = ParagraphStyle('ContractCenter', parent=body_style, alignment=TA_CENTER)
    contact_style = ParagraphStyle('ContactBox', parent=body_style, fontSize=8, leading=11, alignment=TA_CENTER, backColor=colors.HexColor('#f0f4f8'))

    elements = []

    # Format dates
    def fmt_date(d):
        return d.strftime('%d/%m/%Y') if d else 'XX/XX/XXXX'

    client_name = client.name if client else 'N/A'
    client_email = client.email or ''
    client_phone = client.phone or ''
    client_doc = client.document_id or ''
    client_nationality = client.nationality or ''
    prop_name = prop.name if prop else 'N/A'
    prop_address = prop.address if prop else ''
    start_date = fmt_date(contract.start_date)
    end_date = fmt_date(contract.end_date)
    value = f"{contract.value:,.2f}" if contract.value else 'XXX'
    deposit_value = f"{contract.value:,.2f}" if contract.value else 'XXX'

    # Use client code as tenant reference
    tenant_ref = client.code if client and client.code else f"DA-{client.id:04d}" if client else "XXXX"

    # === PAGE 1 - Header & Parties ===
    elements.append(Paragraph("<b>Leevin APP Service and Management LTD</b>", title_style))
    elements.append(Spacer(1, 6))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#1e3a5f')))
    elements.append(Spacer(1, 12))

    elements.append(Paragraph("This Agreement is made between <b>Leevin APP Service and Management Ltd.</b>, mentioned as the Licensor, and (below) as the Licensees or he/his, together referred to as the Parties.", body_style))
    elements.append(Spacer(1, 12))

    # Licensor info
    elements.append(Paragraph("<b>Licensor:</b> Leevin APP Service and Management LTD", bold_style))
    elements.append(Paragraph("CRO: 642807", body_style))
    elements.append(Paragraph("Address: 14 Dyke Parade, Mardyke, Cork - T12 K5W7", body_style))
    elements.append(Paragraph("Email: leevincork@leevin.app", body_style))
    elements.append(Spacer(1, 12))

    # Licensee info
    elements.append(Paragraph("<b>Licensee 1:</b>", bold_style))
    licensee_data = [
        ["Name:", client_name],
        ["Passport:", client_doc],
        ["Nationality:", client_nationality],
        ["Address:", prop_address or prop_name],
        ["Email:", client_email],
        ["Phone number:", client_phone],
    ]
    t = Table(licensee_data, colWidths=[100, 350])
    t.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 8))

    elements.append(Paragraph(f"<b>Tenant Reference Number: {tenant_ref}</b>", bold_style))
    elements.append(Spacer(1, 8))
    elements.append(Paragraph(f"<b>Property:</b> {prop_name} - {prop_address}", body_style))

    # === PAGE 2+ - Terms ===
    elements.append(Spacer(1, 16))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cccccc')))
    elements.append(Spacer(1, 8))

    elements.append(Paragraph("The Parties agree that the Licensee/s shall use a portion of the premises managed by the Licensor, on the following terms:", body_style))

    # Clause 1
    elements.append(Paragraph("<b>1. License to Occupy.</b>", heading_style))
    elements.append(Paragraph(f"The Licensor permits the Licensee to occupy the house and to use the Furniture and Furnishings under the property rules. This licence commences on: <b>{start_date}</b> and terminates on <b>{end_date}</b>. If the licensee wants to terminate or extend the contract before or on the termination date mentioned above, they are subject to give us 1 month written notice to leevincork@leevin.app (please note that until the original termination date is active is their responsibility to replace the place if they want to leave the property before).", body_style))

    # Clause 2
    elements.append(Paragraph("<b>2. License fee.</b>", heading_style))
    elements.append(Paragraph(f"The total amount to be paid monthly is <b>\u20ac{value}</b> every 28th of each month.", body_style))
    elements.append(Spacer(1, 4))

    bank_data = [
        ["Account Name:", "Leevin APP Service and Management LTD"],
        ["IBAN:", "IE44 AIBK 9363 8381 2000 67"],
        ["Tenant reference:", tenant_ref],
    ]
    bt = Table(bank_data, colWidths=[120, 330])
    bt.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8f9fa')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#dee2e6')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(bt)
    elements.append(Spacer(1, 6))

    elements.append(Paragraph("<b>Please send us a copy of the bank transfer as soon as it is done.</b>", center_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("For both online and in-person payments at the bank or our office, PLEASE use your personal tenant reference number in order to identify the payment of your rent. In the absence of your reference, you may receive unwanted charges/fees from us and warnings.", small_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("A penalty of 5% of the total amount will be applied to late payments, up to 2 working days of delay, and from the 4th day, the penalty will be an extra 3% per day (based on the full amount). After 7 days, Leevin APP Service and Management Ltd. have the right to repossess the room and remove any personal belongings unless agreed upon differently in writing with the parties.", body_style))
    elements.append(Paragraph("Licensor has the right to share the common areas (i.e. living room, kitchen, bathrooms) equally with the other licensees.", body_style))

    # Clause 3
    elements.append(Paragraph("<b>3. Deposit.</b>", heading_style))
    elements.append(Paragraph(f"Licensee must pay <b>\u20ac{deposit_value}</b> to Leevin APP Service and Management Ltd. as a security deposit for any liabilities that may occur during his/her stay, including the house inspection for any breakage or misconduct of the house rules. If the booking is cancelled this will not be returned under any circumstances.", body_style))
    elements.append(Paragraph("During the term mentioned in point one, this deposit will become a security deposit against any liabilities that may occur during the length of this agreement. Deductions permitted by Irish law are made from the security deposit and the remaining amount, if any, shall be returned to the Customer within a week after the termination of the agreement, by bank transfer, unless agreed differently in written form among the parties. Unclaimed deposits will not be returned after 90 days. No interest will be payable to the Licensee in respect of the deposit monies.", body_style))

    # Clause 4
    elements.append(Paragraph("<b>4. End of agreement.</b>", heading_style))
    elements.append(Paragraph("The right to use the premises will terminate on the date specified in Section 1 unless agreed differently by the licensor and licensee by writing and in advance. In case the full amount of Section 2 has not been paid, termination before the above-mentioned date will incur a penalty charge of the same amount of security deposit paid for confirming the room as specified in Section 3 and further legal actions. Paid rent is NON-REFUNDABLE if the Licensee leaves before mentioned date in Section 1, whatever circumstances may occur; (all requests of period extension in this contract must be sent to the email: leevincork@leevin.app by the licensee)", body_style))

    # Clause 5
    elements.append(Paragraph("<b>5. Nature of this agreement.</b>", heading_style))
    elements.append(Paragraph("This Agreement is not intended to confer exclusive possession on the Licensee or to create the relationship of landlord and tenant between the parties. The Licensee shall not be entitled to a tenancy, or to be an assured shorthold or assured tenancy, or to any statutory protection under the Housing Act 1988 or to any other statutory security of tenure now or when this Licence ends.", body_style))
    elements.append(Paragraph("This Agreement is personal to the Licensee and is not assignable to any other person. The Licence will immediately terminate without notice upon the Licensee not living at the property and on one-week arrears of the licence fee arising.", body_style))

    # Clause 6
    elements.append(Paragraph("<b>6. Access and Use of Facilities.</b>", heading_style))
    elements.append(Paragraph("For so long as he is occupying the Room under this Licence the Licensee shall have the right to use the front door, entrance hall, staircase and landings of the House and to use the kitchen for cooking, eating and the storage of food and to use the lavatory and bathroom in common with the Licensor and/or other Licensees.", body_style))
    elements.append(Paragraph("6.1 The Licensee shall use the house as a private residence only and will not run any business from the House.", small_style))
    elements.append(Paragraph("6.2 The Licensee will not let or purport to let or share either the Room or any communal part of the House or take in a lodger or paying guest or without the written consent of the Licensor permit any other person to sleep or stay at the House.", small_style))
    elements.append(Paragraph("6.3 The Licensee will not have exclusive possession of the Room and the Licensor will be entitled to enter it at all reasonable times to carry out the agreed services and carry out any necessary repairs.", small_style))
    elements.append(Paragraph("6.4 The Licensee will comply with any \"House Rules\" either attached to this Licence Agreement or exhibited in the House.", small_style))
    elements.append(Paragraph("6.5 <b>Keys.</b> The Licensor will issue to the Licensee the keys. If the Licensee loses a key, the Licensor will replace it upon the Licensee paying the reasonable cost of having a replacement cut.", small_style))
    elements.append(Paragraph("6.6 <b>Furniture and Furnishings.</b> The Licensee must keep the Furniture and Furnishings and all items listed on the Inventory in good order and condition and must not remove any of them from the Room. The Licensee must make good any damage to the Furniture and Furnishings caused by him.", small_style))

    # Clause 7-12
    elements.append(Paragraph("<b>7. Cleanings.</b>", heading_style))
    elements.append(Paragraph("It is the responsibility of all Customers to contribute to daily household chores in order to maintain, at any time, an acceptable status of order and cleanness. Failure to do so will result in a cleaning charge that will be equally divided by the occupants of the property and/or deducted from the security deposit.", body_style))

    elements.append(Paragraph("<b>8. Overnight Guests.</b>", heading_style))
    elements.append(Paragraph("Overnight guests are not allowed. Breach of rules will result in the immediate termination of the agreement with the loss of deposit and application of penalties.", body_style))

    elements.append(Paragraph("<b>9. Utility Bills.</b>", heading_style))
    elements.append(Paragraph("The Licensee shall be responsible for paying for all water, gas, electricity and telephone costs consumed or supplied in the Room during the Licensee's occupation as recorded by the separate meter in the Room if a separate meter is not fitted and/or for an equal proportion of the costs consumed or supplied in the shared parts of the House.", body_style))

    elements.append(Paragraph("<b>10. Noise Level.</b>", heading_style))
    elements.append(Paragraph("The Tenants must maintain a noise level that will not affect the quality of life of any neighbours. Any noise should be strictly avoided from 10:00 pm to 8:00 am. No house parties are allowed (\u20ac100 fine).", body_style))

    elements.append(Paragraph("<b>11. Smoking.</b>", heading_style))
    elements.append(Paragraph("Smoking is severely NOT allowed inside the premises. Any Licensee accused/notified of smoking inside the premises will be immediately fined \u20ac100 and may result in immediate eviction. The possession and use of illicit drugs is forbidden.", body_style))

    elements.append(Paragraph("<b>12. Code of Conduct.</b>", heading_style))
    elements.append(Paragraph("The Licensee must use his best endeavours to share use of the Room and property amicably and peaceably. Anti-social behaviour reported by any tenant will result in immediate eviction. Anti-social behaviour includes violence, intimidation, coercion, harassment, obstruction, threats and any other behaviour that interferes with the peaceful occupation. Pets are not allowed.", body_style))

    # Clause 13-19
    elements.append(Paragraph("<b>13. Condition of the Premises.</b>", heading_style))
    elements.append(Paragraph("Licensee acknowledges that he/she has examined the premise and that they are in good condition. Upon the termination of this Agreement for any cause, Licensee will leave the premises in their original good condition.", body_style))

    elements.append(Paragraph("<b>14. Early termination.</b>", heading_style))
    elements.append(Paragraph("14.1 By the Licensor without notice if the licence fee is not paid on the day when it becomes due or if the Licensee is in breach of any of the terms of this Agreement.", small_style))
    elements.append(Paragraph("14.2 By either party giving not less than 1 month written notice sent to leevincork@leevin.app. Should the Licensee terminate their lease before fixed term expiry, they will lose their deposit, unless the tenant secures a suitable Licensee to reassign their remaining lease term to.", small_style))

    elements.append(Paragraph("<b>15. Subletting and Assignment.</b>", heading_style))
    elements.append(Paragraph("Licensee may not lease, sublease, or assign the premises with/to other people. Tenants are not allowed to change bedrooms assigned or replace your place without first seeking approval from Leevin APP Service and Management Ltd.", body_style))

    elements.append(Paragraph("<b>16. Rubbish.</b>", heading_style))
    elements.append(Paragraph("The Licensee must ensure that all rubbish is disposed of daily and placed in the rubbish bin provided and comply with all recycling and refuse disposal requirements of the Local Authority.", body_style))

    elements.append(Paragraph("<b>17. Property Maintenance.</b>", heading_style))
    elements.append(Paragraph("Our representatives have the right of access to the property at any reasonable time for the purpose of inspection and to carry out any essential repair or maintenance work. Licensee has an obligation to report immediately the Licensor of any damage, loss or broken items.", body_style))

    # Contact box
    elements.append(Spacer(1, 8))
    contact_data = [
        ["PROPERTY MANAGEMENT - CONTACT"],
        ["leevin.app | +353 85 266 2455"],
        ["9 am until 5 pm"],
        ["Emergency: leevincork@leevin.app"],
    ]
    ct = Table(contact_data, colWidths=[450])
    ct.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0f4f8')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#dee2e6')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(ct)

    elements.append(Paragraph("<b>18. Contact information.</b> It is the responsibility of the tenants to provide their updated contact phone number and email, in case of emergencies.", body_style))
    elements.append(Paragraph("<b>19. Personal Safety and Belongings.</b> Leevin APP Service and Management Ltd. cannot be held liable for any personal injury inside premises, loss or damage to personal effects whatsoever.", body_style))
    elements.append(Paragraph("<b>20. Binding Agreement.</b> This agreement will not be enforceable until signed by both Parties. Any modification to this Agreement must be in writing, including an email agreed from both parties.", body_style))

    # === SIGNATURE PAGE ===
    elements.append(Spacer(1, 20))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#1e3a5f')))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph("<b>We, the Parties, agree to the above-stated terms.</b>", center_style))
    elements.append(Spacer(1, 20))

    elements.append(Paragraph("<b>Licensor:</b> Leevin APP Service &amp; Management LTD", bold_style))
    elements.append(Spacer(1, 6))
    # Licensor signature - usar assinatura padrao da Leevin APP
    _licensor_sig_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "signature_licensor.png")
    if os.path.exists(_licensor_sig_path):
        try:
            sig_img = Image(_licensor_sig_path, width=180, height=75)
            elements.append(Paragraph("Signature:", body_style))
            elements.append(sig_img)
        except Exception:
            elements.append(Paragraph("Signature: ___________________________________", body_style))
    elif contract.signature_licensor:
        try:
            sig_data = contract.signature_licensor
            if sig_data.startswith('data:'):
                sig_data = sig_data.split(',', 1)[1]
            sig_bytes = base64.b64decode(sig_data)
            sig_buf = io.BytesIO(sig_bytes)
            sig_img = Image(sig_buf, width=180, height=60)
            elements.append(Paragraph("Signature:", body_style))
            elements.append(sig_img)
        except Exception:
            elements.append(Paragraph("Signature: ___________________________________", body_style))
    else:
        elements.append(Paragraph("Signature: ___________________________________", body_style))
    elements.append(Spacer(1, 20))

    elements.append(Paragraph(f"<b>Licensee 1:</b> {client_name}", bold_style))
    elements.append(Paragraph(f"Passport: {client_doc}", body_style))
    elements.append(Spacer(1, 6))
    # Licensee signature
    if contract.signature_licensee:
        try:
            sig_data = contract.signature_licensee
            if sig_data.startswith('data:'):
                sig_data = sig_data.split(',', 1)[1]
            sig_bytes = base64.b64decode(sig_data)
            sig_buf = io.BytesIO(sig_bytes)
            sig_img = Image(sig_buf, width=180, height=60)
            elements.append(Paragraph("Signature:", body_style))
            elements.append(sig_img)
        except Exception:
            elements.append(Paragraph("Signature: ___________________________________", body_style))
    else:
        elements.append(Paragraph("Signature: ___________________________________", body_style))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("Date: _______________________________________", body_style))

    # Page numbering
    def add_page_number(canvas_obj, doc_obj):
        canvas_obj.saveState()
        canvas_obj.setFont('Helvetica', 8)
        canvas_obj.setFillColor(colors.HexColor('#666666'))
        canvas_obj.drawCentredString(A4[0]/2, 1.5*cm, f"Page {doc_obj.page} - Leevin APP Licence Agreement")
        canvas_obj.restoreState()

    doc.build(elements, onFirstPage=add_page_number, onLaterPages=add_page_number)
    buf.seek(0)
    return buf


@router.get("/{contract_id}/pdf")
def download_contract_pdf(contract_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato nao encontrado")
    client = db.query(Client).filter(Client.id == contract.client_id).first()
    prop = db.query(Property).filter(Property.id == contract.property_id).first()
    buf = _generate_contract_pdf(contract, client, prop, db)
    client_name = client.name.replace(' ', '_') if client else 'contrato'
    filename = f"Licence_Agreement_{client_name}.pdf"
    return StreamingResponse(buf, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={filename}"})


@router.post("/{contract_id}/generate-sign-link")
def generate_sign_link(contract_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Gera um token unico para link de assinatura publica."""
    try:
        contract = db.query(Contract).filter(Contract.id == contract_id).first()
        if not contract:
            raise HTTPException(status_code=404, detail="Contrato nao encontrado")
        if not contract.sign_token:
            contract.sign_token = uuid.uuid4().hex
            db.commit()
            db.refresh(contract)
        return {"sign_token": contract.sign_token}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao gerar link: {str(e)}")


@router.post("/{contract_id}/send-email")
def send_contract_email(contract_id: int, data: EmailRequest, request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato nao encontrado")
    client = db.query(Client).filter(Client.id == contract.client_id).first()
    prop = db.query(Property).filter(Property.id == contract.property_id).first()

    # Gerar sign_token se nao existir
    if not contract.sign_token:
        contract.sign_token = uuid.uuid4().hex
        db.commit()
        db.refresh(contract)

    # Construir link de assinatura
    frontend_url = os.getenv("FRONTEND_URL", "")
    if not frontend_url:
        # Tentar inferir do request
        origin = request.headers.get("origin", "")
        if origin:
            frontend_url = origin
        else:
            frontend_url = "http://localhost:5173"
    sign_link = f"{frontend_url}/sign/{contract.sign_token}"

    buf = _generate_contract_pdf(contract, client, prop, db)
    pdf_bytes = buf.read()

    from services.email_service import send_email, EMAIL_PASSWORD

    if not EMAIL_PASSWORD:
        return {
            "success": False,
            "message": f"Email nao configurado. Link de assinatura: {sign_link}",
            "sign_link": sign_link,
            "sign_token": contract.sign_token
        }

    try:
        client_name = client.name.replace(' ', '_') if client else 'contrato'

        html_body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1e3a5f; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Leevin APP</h1>
                <p style="color: #aec6e8; margin: 5px 0 0;">Service and Management LTD</p>
            </div>
            <div style="padding: 30px 20px;">
                <p>Dear <b>{client.name if client else 'Client'}</b>,</p>
                <p>Please find attached your Licence Agreement with Leevin APP.</p>
                <p>To sign your contract digitally, please click the button below:</p>
                <div style="text-align: center; margin: 25px 0;">
                    <a href="{sign_link}" style="background-color: #1e3a5f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                        Sign Contract Online
                    </a>
                </div>
                <p style="font-size: 12px; color: #888;">Or copy this link: {sign_link}</p>
                <p>Best regards,<br><b>Leevin APP Service and Management LTD</b></p>
            </div>
        </div>
        """

        result = send_email(
            to=data.to_email,
            subject=data.subject or "Leevin APP - Licence Agreement",
            html_body=html_body,
            attachment_bytes=pdf_bytes,
            attachment_filename=f"Licence_Agreement_{client_name}.pdf",
        )

        if result["success"]:
            return {"success": True, "message": f"Email enviado para {data.to_email}", "sign_link": sign_link}
        else:
            return {"success": False, "message": f"Erro ao enviar: {result.get('error', 'Unknown')}", "sign_link": sign_link}
    except Exception as e:
        return {"success": False, "message": f"Erro ao enviar: {str(e)}", "sign_link": sign_link}


# === PUBLIC ENDPOINTS (sem auth) - para cliente assinar ===

class PublicSignatureRequest(BaseModel):
    signature: str  # base64 PNG


@public_router.get("/{token}")
def get_contract_for_signing(token: str, db: Session = Depends(get_db)):
    """Endpoint publico: retorna dados do contrato para o cliente assinar."""
    contract = db.query(Contract).filter(Contract.sign_token == token).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato nao encontrado ou link invalido")
    client = db.query(Client).filter(Client.id == contract.client_id).first()
    prop = db.query(Property).filter(Property.id == contract.property_id).first()
    return {
        "id": contract.id,
        "client_name": client.name if client else "N/A",
        "client_email": client.email if client else "",
        "property_name": prop.name if prop else "N/A",
        "property_address": prop.address if prop else "",
        "start_date": str(contract.start_date) if contract.start_date else None,
        "end_date": str(contract.end_date) if contract.end_date else None,
        "value": contract.value,
        "signed": contract.signed,
        "has_licensee_signature": bool(contract.signature_licensee),
        "has_licensor_signature": bool(contract.signature_licensor),
    }


@public_router.put("/{token}")
def sign_contract_public(token: str, data: PublicSignatureRequest, db: Session = Depends(get_db)):
    """Endpoint publico: cliente envia sua assinatura."""
    contract = db.query(Contract).filter(Contract.sign_token == token).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato nao encontrado ou link invalido")
    if contract.signature_licensee:
        raise HTTPException(status_code=400, detail="Este contrato ja foi assinado pelo cliente")
    contract.signature_licensee = data.signature
    if contract.signature_licensor and contract.signature_licensee:
        contract.signed = True
    db.commit()
    return {"detail": "Assinatura registrada com sucesso!", "signed": contract.signed}


@public_router.get("/{token}/pdf")
def download_contract_public(token: str, db: Session = Depends(get_db)):
    """Endpoint publico: cliente pode baixar o PDF do contrato."""
    contract = db.query(Contract).filter(Contract.sign_token == token).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato nao encontrado")
    client = db.query(Client).filter(Client.id == contract.client_id).first()
    prop = db.query(Property).filter(Property.id == contract.property_id).first()
    buf = _generate_contract_pdf(contract, client, prop, db)
    client_name = client.name.replace(' ', '_') if client else 'contrato'
    filename = f"Licence_Agreement_{client_name}.pdf"
    return StreamingResponse(buf, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={filename}"})
