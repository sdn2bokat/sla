import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const htmlParam = searchParams.get("html");

  if (!htmlParam) {
    return new NextResponse("Harap berikan HTML-nya.", { status: 400 });
  }

  let browser;
  try {
    const isVercel = !!process.env.VERCEL_ENV;
    const pptr =
      isVercel
        ? puppeteer
        : ((await import("puppeteer")) as unknown as typeof puppeteer);

    browser = await pptr.launch(
      isVercel
        ? {
            args: chromium.args,
            executablePath: await chromium.executablePath(),
            headless: true
          }
        : {
            headless: true,
            args: puppeteer.defaultArgs()
          }
    );

    const page = await browser.newPage();

    // ⚠️ Wrap HTML agar style utuh
    const finalHTML = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4;
              margin: 12mm;
            }

            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              print-color-adjust: exact !important;
              -webkit-print-color-adjust: exact !important;
            }

            * {
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>${htmlParam}</body>
      </html>
    `;

    await page.setContent(finalHTML, { waitUntil: "networkidle0" });

    // biar CSS benar-benar ter-render
    await page.waitForNetworkIdle();

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "12mm",
        bottom: "12mm",
        left: "12mm",
        right: "12mm"
      }
    });

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="page-output.pdf"'
      }
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Terjadi kesalahan saat membuat PDF.", {
      status: 500
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
