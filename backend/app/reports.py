import io
from datetime import datetime, timezone
from xml.sax.saxutils import escape

import qrcode
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from .config import settings

LIMITS = [
    "Satellite resolution is 10 m: small structures and narrow boundary changes can be missed.",
    "Reference boundaries are inventory boundaries, not legal boundaries. Match against revenue and survey records.",
    "A measured change in water area is an observation. It is not a finding of illegal encroachment.",
    "This report supports field verification by an authorised officer. It does not replace it.",
]


def build_pdf(report_id: str, water_body: dict, result: dict, params: dict, hotspots: list[dict]) -> bytes:
    ss = getSampleStyleSheet()
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=16 * mm,
                            bottomMargin=16 * mm, title=f"AquaSentinel evidence report {report_id}")
    S = []
    S.append(Paragraph("Water body change evidence report", ss["Title"]))
    S.append(Paragraph(escape(f"{water_body.get('name', 'Unnamed water body')} - {water_body.get('districtName', '')}"), ss["Heading3"]))
    S.append(Paragraph(f"Report ID: {report_id} &nbsp; Generated: {datetime.now(timezone.utc):%Y-%m-%d %H:%M} UTC", ss["Normal"]))
    S.append(Spacer(1, 6 * mm))

    b, c = params["baseline"], params["comparison"]
    rows = [
        ["Measure", "Value"],
        ["Baseline period", f"{b['season']} {b['year']} ({result['validScenes']['baseline']} usable scenes)"],
        ["Comparison period", f"{c['season']} {c['year']} ({result['validScenes']['comparison']} usable scenes)"],
        ["Water area, baseline", f"{result['baselineWaterHa']} ha"],
        ["Water area, comparison", f"{result['comparisonWaterHa']} ha"],
        ["Net change", f"{result['netChangeHa']} ha ({result['changePercent'] if result['changePercent'] is not None else 'n/a'} %)"],
        ["Persistent loss (same-season)", f"{result['persistentLossHa']} ha"],
        ["Confidence", result["confidence"]],
        ["Cross-check with JRC history", "Disagrees - review" if result["jrcDisagreement"] else "Consistent"],
    ]
    t = Table(rows, colWidths=[60 * mm, 110 * mm])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#12343B")),
                           ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                           ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#9AA8A4")),
                           ("VALIGN", (0, 0), (-1, -1), "TOP")]))
    S += [t, Spacer(1, 6 * mm), Paragraph("Candidate zones for inspection", ss["Heading2"])]

    hs = [["ID", "Area (ha)", "Latitude", "Longitude", "New built-up", "Priority"]]
    for h in hotspots[:30]:
        hs.append([h["label"], h["areaHa"], h["centroid"]["lat"], h["centroid"]["lon"],
                   f"{round(h['builtUpFraction'] * 100)}%", h["priority"]])
    if len(hs) == 1:
        hs.append(["-", "No persistent-loss zones above the minimum size", "", "", "", ""])
    ht = Table(hs, repeatRows=1)
    ht.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#9AA8A4")),
                            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E3E9E5"))]))
    S += [ht, Spacer(1, 6 * mm), Paragraph("Method", ss["Heading2"])]
    m = result["method"]
    S.append(Paragraph(escape(
        f"Sentinel-2 L2A surface reflectance, cloud/shadow/cirrus masked with the SCL band. Water = {m['index'].upper()} > {m['threshold']}. "
        f"A pixel is water in a period if it is water in at least half of valid scenes. Persistent loss = water in at least "
        f"{int(m['persistence']['waterFreq'] * 100)}% of baseline scenes and in at most {int(m['persistence']['dryFreq'] * 100)}% of comparison scenes. "
        f"Areas are computed from 10 m pixel areas. Method version {result['methodVersion']}. Sources: {', '.join(result['sources'])}."), ss["Normal"]))
    S += [Spacer(1, 4 * mm), Paragraph("Limitations", ss["Heading2"])]
    S += [Paragraph("- " + escape(x), ss["Normal"]) for x in LIMITS]

    qr = qrcode.make(f"{settings.public_verify_url}/verify/{report_id}")
    q = io.BytesIO()
    qr.save(q, format="PNG")
    q.seek(0)
    S += [Spacer(1, 8 * mm), Image(q, 28 * mm, 28 * mm),
          Paragraph("Scan to verify this document. Any edit to the PDF changes its SHA-256 and verification fails.", ss["Italic"])]
    doc.build(S)
    return buf.getvalue()
