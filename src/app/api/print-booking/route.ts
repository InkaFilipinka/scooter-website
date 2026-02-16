import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getStore } from "@netlify/blobs";
import { addOns } from "@/data/add-ons";

const M = 50;
const LINE = 14;
const LINE_SMALL = 11;

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
    const amount_paid = Number(booking.amount_paid ?? 0);
    const amount_to_pay = Math.max(0, total_cost - amount_paid);
    const payment_method = String(booking.payment_method ?? "").trim();
    const payment_reference = String(booking.payment_reference ?? "").trim();
    const addOnIds = (booking.addOns as string[] | undefined) ?? [];
    const add_ons = addOnIds.length > 0
      ? addOnIds.map((aid) => addOns.find((a) => a.id === aid)?.name ?? aid).join(", ")
      : "None";
    const days = booking.startDate && booking.endDate
      ? Math.ceil((new Date(String(booking.endDate)).getTime() - new Date(String(booking.startDate)).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    const dailyRate = days > 0 ? Math.round(total_cost / days) : 0;

    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const page = doc.addPage([595, 842]);
    let y = 830;
    const draw = (text: string, size = 10, bold = false) => {
      page.drawText(text, {
        x: M,
        y,
        size,
        font: bold ? fontBold : font,
        color: rgb(0, 0, 0),
      });
      y -= size <= 9 ? LINE_SMALL : LINE;
    };

    draw("Scooter Rental Agreement", 16, true);
    y -= 6;
    draw("1. Rental Company / Owner Information", 11, true);
    draw("Name / Contact Number    Palm Riders - +63 945 701 4440");
    draw("Address                  Blue Corner House, Purok V, General Luna");
    y -= 4;
    draw("2. Renter Information", 11, true);
    draw("Full Name and Contact Number    " + customer_name + " - " + customer_phone);
    draw("Address                         _________________________________________");
    draw("Id type and serial number       _________________________________________");
    y -= 4;
    draw("3. Scooter Information", 11, true);
    draw("Make / Model / Color / Plate Number    " + scooter_name + " / _________________________");
    draw("Condition Before Rental                3 months old, good.");
    y -= 4;
    draw("4. Rental Terms & Fees", 11, true);
    draw("Rental Period: From " + startDate + " To " + endDate);
    draw("Fuel Level at Start: ______________________________");
    draw("Rate Option (select one): ☐ Daily ☐ Weekly ☐ Monthly — Rate: ₱ " + (dailyRate || "__________") + "    Total Payment: ₱ " + total_cost);
    y -= 2;
    draw("1. Total amount to pay: ₱ " + total_cost, 10, true);
    const paidLine = "2. Amount paid: ₱ " + amount_paid + (payment_method ? " (" + payment_method + (payment_reference ? (payment_method.toLowerCase().includes("card") ? " – Code: " + payment_reference : " – ID: " + payment_reference) : "") + ")" : "");
    draw(paidLine.length > 90 ? paidLine.slice(0, 87) + "..." : paidLine);
    draw("3. Amount to pay: ₱ " + amount_to_pay, 10, true);
    draw("Add-ons chosen: " + (add_ons.length > 75 ? add_ons.slice(0, 72) + "..." : add_ons));
    y -= 2;
    draw("⚠ If scooter is returned below this fuel level, renter will be charged ₱70 per bar missing on the fuel indicator.", 9);
    y -= 6;
    draw("5. Rules & Responsibilities", 11, true);
    draw("1. The renter shall return the scooter in the same condition as received.");
    draw("2. A video recording of the scooter's condition will be made on the day of rental. Any damages not present in the video will be considered the renter's responsibility.");
    draw("3. The renter must pay for the full repair cost of any damages to the scooter during the rental period.");
    draw("4. The scooter may only be driven by the renter named in this agreement.");
    draw("5. Use of the scooter while intoxicated, reckless, or for illegal activities is strictly prohibited.");
    y -= 4;
    draw("Lost Key ₱2000    Fuel Below Start Level ₱70 per missing bar    Traffic Fine / Violation Full amount to be paid by renter");
    draw("Major Damage / Theft Cost of repair or replacement    Lost or Damaged Helmet ₱3000    Lost or Damaged Phone Holder ₱500", 9);
    y -= 6;
    draw("7. Agreement", 11, true);
    draw("By signing below, both parties agree to the terms and conditions of this agreement.");
    draw("Renter Signature ____________________    Name ____________________    Date ____/____/______");
    draw("Owner Signature ____________________    Name ____________________    Date ____/____/______");
    y -= 4;
    draw("Booking ID: " + id + " — " + new Date().toLocaleString(), 9);

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
