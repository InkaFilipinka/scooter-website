import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getStore } from "@netlify/blobs";
import { addOns } from "@/data/add-ons";

const M = 50;
const LINE = 18;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Booking id required" }, { status: 400 });
    }

    const store = getStore("bookings");
    const booking = (await store.get(id, { type: "json" })) as Record<string, unknown> | null;
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const customer_name = String(booking.name ?? "");
    const customer_phone = String(booking.phone ?? "");
    const customer_email = String(booking.email ?? "");
    const scooter_name = String(booking.scooter ?? "");
    const startDate = booking.startDate ? new Date(String(booking.startDate)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
    const endDate = booking.endDate ? new Date(String(booking.endDate)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
    const total_cost = Number(booking.total ?? 0);
    const addOnIds = (booking.addOns as string[] | undefined) ?? [];
    const add_ons = addOnIds.length > 0
      ? addOnIds.map((aid) => addOns.find((a) => a.id === aid)?.name ?? aid).join(", ")
      : "None";
    const deposit_amount = Number(booking.deposit_amount ?? 0);
    const balance_owed = total_cost - deposit_amount;

    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const page = doc.addPage([595, 842]);
    let y = 820;
    const draw = (text: string, size = 11, bold = false) => {
      page.drawText(text, {
        x: M,
        y,
        size,
        font: bold ? fontBold : font,
        color: rgb(0, 0, 0),
      });
      y -= LINE;
    };

    draw("Scooter Rental Agreement", 22, true);
    y -= 10;
    draw("1. Rental Company / Owner Information", 12, true);
    draw("Name: Palm Riders - +63 945 701 4440");
    draw("Address: Blue Corner House, Purok V, General Luna");
    y -= 5;
    draw("2. Renter Information", 12, true);
    draw("Full Name and Contact: " + customer_name + " - " + customer_phone);
    draw("Email: " + customer_email);
    draw("Address: _________________________________________");
    draw("Id type and serial: _________________________________________");
    y -= 5;
    draw("3. Scooter Information", 12, true);
    draw("Make / Model: " + scooter_name);
    draw("Color / Plate: _________________________");
    draw("Condition: 3 months old, good.");
    y -= 5;
    draw("4. Rental Terms & Fees", 12, true);
    draw("Rental Period: From " + startDate + " To " + endDate);
    draw("Fuel at Start: _________________________");
    draw("Total Payment: P" + total_cost);
    if (deposit_amount > 0) {
      draw("Deposit paid: P" + deposit_amount + " | Balance on pickup: P" + Math.round(balance_owed));
    }
    const addOnsShort = add_ons.length > 70 ? add_ons.slice(0, 67) + "..." : add_ons;
    draw("Add-ons: " + addOnsShort);
    y -= 5;
    draw("5. Rules & Responsibilities", 12, true);
    draw("1. Return in same condition. 2. Video on rental day. 3. Renter pays damages.");
    draw("4. Only named renter drives. 5. No intoxicated/reckless/illegal use.");
    y -= 10;
    draw("7. Agreement", 12, true);
    draw("Renter Signature: ____________ Name: ____________ Date: __/__/____");
    draw("Owner Signature: ____________ Name: ____________ Date: __/__/____");
    draw("Booking ID: " + id + " - " + new Date().toLocaleString());

    const pdfBytes = await doc.save();
    const filename = "rental-" + id.replace(/[^a-zA-Z0-9-]/g, "_") + ".pdf";
    const buffer = pdfBytes.buffer.slice(
      pdfBytes.byteOffset,
      pdfBytes.byteOffset + pdfBytes.byteLength
    ) as ArrayBuffer;

    return new NextResponse(new Blob([buffer]), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="' + filename + '"',
      },
    });
  } catch (e) {
    console.error("Print booking error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
