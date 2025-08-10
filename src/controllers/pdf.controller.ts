import { Request, Response } from "express";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import AppDataSource from "../config/database";
import { ProductCompany } from "../entity/ProductCompany";
import { AuthRequest } from "../middleware/auth.middleware";

interface QRCodeData {
  productId: number;
  productName: string;
  reference?: string;
  EAN?: string;
  qrCodeDataUrl: string;
}

export class PdfController {
  static async generateQRCodesPDF(req: AuthRequest, res: Response) {
    try {
      const companyId = req.user!.company.id;
      const baseUrl =
        req.headers.origin || req.get("host") || "http://localhost:4200";

      const productCompanyRepository =
        AppDataSource.getRepository(ProductCompany);
      const productCompanies = await productCompanyRepository.find({
        where: { companyId },
        relations: ["product"],
      });

      if (productCompanies.length === 0) {
        return res.status(404).json({ message: "Aucun produit en stock" });
      }

      // Générer les QR codes
      const qrCodeData: QRCodeData[] = await Promise.all(
        productCompanies.map(async (item) => {
          const scanUrl = `${baseUrl}/scan/${item.productId}`;
          const qrCodeDataUrl = await QRCode.toDataURL(scanUrl, {
            width: 200,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          });

          return {
            productId: item.productId,
            productName: item.product?.name || "Produit sans nom",
            reference: item.product?.reference,
            EAN: item.product?.EAN,
            qrCodeDataUrl,
          };
        })
      );

      // Créer le PDF
      const pdfBuffer = await PdfController.createPDF(qrCodeData);

      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:]/g, "-");
      const filename = `qr-codes-stock-${timestamp}.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Length", pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      res.status(500).json({ message: "Erreur lors de la génération du PDF" });
    }
  }

  static async generateSingleQRCodePDF(req: AuthRequest, res: Response) {
    try {
      const { productId } = req.params;
      const companyId = req.user!.company.id;
      const baseUrl =
        req.headers.origin || req.get("host") || "http://localhost:4200";

      const productCompanyRepository =
        AppDataSource.getRepository(ProductCompany);
      const productCompany = await productCompanyRepository.findOne({
        where: {
          productId: parseInt(productId),
          companyId,
        },
        relations: ["product"],
      });

      if (!productCompany) {
        return res
          .status(404)
          .json({ message: "Produit non trouvé dans votre stock" });
      }

      // Générer le QR code pour ce produit
      const scanUrl = `${baseUrl}/scan/${productCompany.productId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(scanUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      const qrCodeData: QRCodeData = {
        productId: productCompany.productId,
        productName: productCompany.product?.name || "Produit sans nom",
        reference: productCompany.product?.reference,
        EAN: productCompany.product?.EAN,
        qrCodeDataUrl,
      };

      // Créer le PDF pour un seul produit
      const pdfBuffer = await PdfController.createSingleProductPDF(qrCodeData);

      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:]/g, "-");
      const filename = `qr-code-${qrCodeData.productName.replace(
        /[^a-zA-Z0-9]/g,
        "-"
      )}-${timestamp}.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Length", pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      res.status(500).json({ message: "Erreur lors de la génération du PDF" });
    }
  }

  private static async createSingleProductPDF(
    qrCodeData: QRCodeData
  ): Promise<Buffer> {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Configuration pour un seul QR code centré
    const qrSize = 50;
    const cardWidth = 70;
    const cardHeight = 80;

    // Centrer la carte sur la page
    const x = (pageWidth - cardWidth) / 2;
    const y = (pageHeight - cardHeight) / 2;

    // Titre du document
    pdf.setFontSize(20);
    pdf.setTextColor(0, 0, 0);
    pdf.text("QR Code Produit", pageWidth / 2, 30, { align: "center" });

    // Dessiner le cadre de la carte
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y, cardWidth - 2, cardHeight - 2);

    // Ajouter le QR code
    const qrX = x + (cardWidth - qrSize) / 2;
    const qrY = y + 5;

    try {
      pdf.addImage(qrCodeData.qrCodeDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
    } catch (error) {
      console.error("Erreur lors de l'ajout du QR code:", error);
      // Dessiner un rectangle de remplacement
      pdf.setFillColor(240, 240, 240);
      pdf.rect(qrX, qrY, qrSize, qrSize, "F");
      pdf.setFontSize(12);
      pdf.text("QR Error", qrX + qrSize / 2, qrY + qrSize / 2, {
        align: "center",
      });
    }

    // Ajouter le nom du produit
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const textY = qrY + qrSize + 8;
    const maxTextWidth = cardWidth - 8;

    // Tronquer le texte si trop long
    let displayName = qrCodeData.productName;
    if (displayName.length > 25) {
      displayName = displayName.substring(0, 22) + "...";
    }

    pdf.text(displayName, x + cardWidth / 2, textY, {
      align: "center",
      maxWidth: maxTextWidth,
    });

    // Ajouter la référence si disponible
    if (qrCodeData.reference) {
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      let refText = `Réf: ${qrCodeData.reference}`;
      if (refText.length > 20) {
        refText = refText.substring(0, 17) + "...";
      }
      pdf.text(refText, x + cardWidth / 2, textY + 6, {
        align: "center",
        maxWidth: maxTextWidth,
      });
    }

    // Ajouter l'EAN si disponible et pas de référence
    if (qrCodeData.EAN && !qrCodeData.reference) {
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      let eanText = `EAN: ${qrCodeData.EAN}`;
      if (eanText.length > 20) {
        eanText = eanText.substring(0, 17) + "...";
      }
      pdf.text(eanText, x + cardWidth / 2, textY + 6, {
        align: "center",
        maxWidth: maxTextWidth,
      });
    }

    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    const instructionY = y + cardHeight + 20;
    pdf.text(
      "Scannez ce QR code pour accéder rapidement à la gestion du stock de ce produit",
      pageWidth / 2,
      instructionY,
      { align: "center", maxWidth: pageWidth - 40 }
    );

    return Buffer.from(pdf.output("arraybuffer"));
  }

  private static async createPDF(qrCodeData: QRCodeData[]): Promise<Buffer> {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const qrSize = 50;
    const cardWidth = 70;
    const cardHeight = 80;
    const margin = 10;
    const cols = Math.floor((pageWidth - 2 * margin) / cardWidth);
    const rows = Math.floor((pageHeight - 2 * margin - 25) / cardHeight);
    const itemsPerPage = cols * rows;

    // Titre du document
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text("QR Codes - Gestion du Stock", pageWidth / 2, 15, {
      align: "center",
    });

    for (let i = 0; i < qrCodeData.length; i++) {
      const item = qrCodeData[i];

      // Calculer la position sur la page
      const pageIndex = i % itemsPerPage;
      const col = pageIndex % cols;
      const row = Math.floor(pageIndex / cols);

      const x = margin + col * cardWidth;
      const y = margin + 25 + row * cardHeight;

      // Nouvelle page si nécessaire
      if (i > 0 && pageIndex === 0) {
        pdf.addPage();
        // Titre
        pdf.setFontSize(16);
        pdf.text("QR Codes - Gestion du Stock", pageWidth / 2, 15, {
          align: "center",
        });
      }

      // Dessiner le cadre de la carte
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.rect(x, y, cardWidth - 2, cardHeight - 2);

      // Ajouter le QR code
      const qrX = x + (cardWidth - qrSize) / 2;
      const qrY = y + 5;

      try {
        pdf.addImage(item.qrCodeDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
      } catch (error) {
        console.error("Erreur lors de l'ajout du QR code:", error);
        // Dessiner un rectangle de remplacement
        pdf.setFillColor(240, 240, 240);
        pdf.rect(qrX, qrY, qrSize, qrSize, "F");
        pdf.setFontSize(8);
        pdf.text("QR Error", qrX + qrSize / 2, qrY + qrSize / 2, {
          align: "center",
        });
      }

      // Ajouter le nom du produit
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const textY = qrY + qrSize + 8;
      const maxTextWidth = cardWidth - 8;

      // Tronquer le texte si trop long
      let displayName = item.productName;
      if (displayName.length > 25) {
        displayName = displayName.substring(0, 22) + "...";
      }

      pdf.text(displayName, x + cardWidth / 2, textY, {
        align: "center",
        maxWidth: maxTextWidth,
      });

      // Ajouter la référence si disponible
      if (item.reference) {
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        let refText = `Réf: ${item.reference}`;
        if (refText.length > 20) {
          refText = refText.substring(0, 17) + "...";
        }
        pdf.text(refText, x + cardWidth / 2, textY + 6, {
          align: "center",
          maxWidth: maxTextWidth,
        });
      }

      // Ajouter l'EAN si disponible et pas de référence
      if (item.EAN && !item.reference) {
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        let eanText = `EAN: ${item.EAN}`;
        if (eanText.length > 20) {
          eanText = eanText.substring(0, 17) + "...";
        }
        pdf.text(eanText, x + cardWidth / 2, textY + 6, {
          align: "center",
          maxWidth: maxTextWidth,
        });
      }
    }

    // Ajouter les numéros de page
    const totalPages = Math.ceil(qrCodeData.length / itemsPerPage);
    for (let p = 1; p <= totalPages; p++) {
      pdf.setPage(p);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Page ${p} / ${totalPages}`, pageWidth - 15, pageHeight - 5, {
        align: "right",
      });
    }
    return Buffer.from(pdf.output("arraybuffer"));
  }
}
