import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as PDFDocument from 'pdfkit';
import {
  GeneratedPatrol,
  PatrolEntry,
  ScoreCardConfig,
} from './interfaces/patrol-generation.interface';

/** Patrol list column config: key, header label, and width as % of effective page width */
const PATROL_LIST_COLUMNS = [
  { key: 'patrol', label: 'Patrol', percent: 7 },
  { key: 'name', label: 'Name', percent: 30 },
  { key: 'club', label: 'Club', percent: 30 },
  { key: 'division', label: 'Division', percent: 13 },
  { key: 'category', label: 'Cat.', percent: 10 },
  { key: 'role', label: 'Role', percent: 10 },
] as const;

@Injectable()
export class PatrolPdfService {
  private readonly ROW_HEIGHT = 18;
  private readonly HEADER_HEIGHT = 22;

  /**
   * Generate PDF for patrol list as a continuous table
   */
  async generatePatrolListPdf(
    tournamentName: string,
    rulesLabel: string,
    location: string,
    date: string,
    patrols: GeneratedPatrol[],
    entries: PatrolEntry[],
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 40,
            bottom: 40,
            left: 30,
            right: 30,
          },
        });

        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // Title
        doc
          .fontSize(18)
          .font('Helvetica-Bold')
          .text(tournamentName, { align: 'center' });

        doc.moveDown(0.3);

        doc
          .fontSize(11)
          .font('Helvetica')
          .text([rulesLabel, location, date].filter(Boolean).join(' • '), {
            align: 'center',
          });

        doc.moveDown(1);

        const leftMargin = 30;
        const rightMargin = 30;
        const effectiveWidth = doc.page.width - leftMargin - rightMargin;
        const colWidths = this.getPatrolListColumnWidths(effectiveWidth);

        // Draw table header
        this.drawTableHeader(doc, leftMargin, colWidths);

        // Sort patrols by target number
        const sortedPatrols = [...patrols].sort(
          (a, b) => a.targetNumber - b.targetNumber,
        );

        // Draw each patrol section
        for (const patrol of sortedPatrols) {
          this.drawPatrolSection(doc, patrol, entries, leftMargin, colWidths);
        }

        // Footer with total count
        doc.moveDown(1);
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(
            `Total: ${entries.length} participants in ${patrols.length} patrols`,
            { align: 'right' },
          );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private getPatrolListColumnWidths(
    effectiveWidth: number,
  ): Record<string, number> {
    const widths: Record<string, number> = {};
    PATROL_LIST_COLUMNS.forEach((col) => {
      widths[col.key] = Math.floor((effectiveWidth * col.percent) / 100);
    });
    return widths;
  }

  /**
   * Draw table header
   */
  private drawTableHeader(
    doc: PDFKit.PDFDocument,
    startX: number,
    colWidths: Record<string, number>,
  ): void {
    const tableWidth = PATROL_LIST_COLUMNS.reduce(
      (sum, col) => sum + colWidths[col.key],
      0,
    );
    let x = startX;
    const y = doc.y;

    doc.rect(startX, y, tableWidth, this.HEADER_HEIGHT).fill('#e0e0e0');
    doc.fillColor('#000000').fontSize(9).font('Helvetica-Bold');

    PATROL_LIST_COLUMNS.forEach((col) => {
      const w = colWidths[col.key];
      doc.text(col.label, x + 5, y + 6, {
        width: w - 10,
        align: col.key === 'role' ? 'right' : 'left',
      });
      x += w;
    });

    doc.y = y + this.HEADER_HEIGHT;
  }

  /**
   * Draw a patrol section with all members
   */
  private drawPatrolSection(
    doc: PDFKit.PDFDocument,
    patrol: GeneratedPatrol,
    entries: PatrolEntry[],
    startX: number,
    colWidths: Record<string, number>,
  ): void {
    const members = [...patrol.members].sort((a, b) => {
      if (a === patrol.leaderId) return -1;
      if (b === patrol.leaderId) return 1;
      const aIsJudge = patrol.judgeIds.includes(a);
      const bIsJudge = patrol.judgeIds.includes(b);
      if (aIsJudge && !bIsJudge) return -1;
      if (!aIsJudge && bIsJudge) return 1;
      return 0;
    });

    const tableWidth = PATROL_LIST_COLUMNS.reduce(
      (sum, col) => sum + colWidths[col.key],
      0,
    );

    // Check if we need a new page
    const sectionHeight = members.length * this.ROW_HEIGHT + 8;
    if (doc.y + sectionHeight > doc.page.height - 60) {
      doc.addPage();
      this.drawTableHeader(doc, startX, colWidths);
    }

    doc
      .strokeColor('#999999')
      .moveTo(startX, doc.y)
      .lineTo(startX + tableWidth, doc.y)
      .stroke();

    const crownPath = path.join(process.cwd(), 'pdf/icons/crown.png');
    const balancePath = path.join(process.cwd(), 'pdf/icons/balance.png');

    members.forEach((memberId, index) => {
      const member = entries.find((e) => e.participantId === memberId);
      if (!member) return;

      const isLeader = patrol.leaderId === memberId;
      const isJudge = patrol.judgeIds.includes(memberId);
      const role = isLeader ? 'Leader' : isJudge ? 'Judge' : '';

      if (index % 2 === 0) {
        doc.rect(startX, doc.y, tableWidth, this.ROW_HEIGHT).fill('#f9f9f9');
      }

      this.drawMemberRow(
        doc,
        patrol.targetNumber,
        member,
        role,
        index === 0,
        crownPath,
        balancePath,
        startX,
        colWidths,
      );
    });
  }

  /**
   * Draw a single member row
   */
  private drawMemberRow(
    doc: PDFKit.PDFDocument,
    patrolNumber: number,
    member: PatrolEntry,
    role: string,
    showPatrolNumber: boolean,
    crownPath: string,
    balancePath: string,
    startX: number,
    colWidths: Record<string, number>,
  ): void {
    let x = startX;
    const y = doc.y;
    const iconSize = 12;
    const iconGap = 8;
    const pad = 5;

    doc.fillColor('#000000').fontSize(8).font('Helvetica');

    // Patrol
    if (showPatrolNumber) {
      doc.font('Helvetica-Bold').text(`#${patrolNumber}`, x + pad, y + 4, {
        width: colWidths.patrol - pad * 2,
      });
    }
    x += colWidths.patrol;

    // Name - full text
    doc.font('Helvetica').text(member.name || '-', x + pad, y + 4, {
      width: colWidths.name - pad * 2,
    });
    x += colWidths.name;

    // Club - full text
    doc.text(member.club || '-', x + pad, y + 4, {
      width: colWidths.club - pad * 2,
    });
    x += colWidths.club;

    // Division
    doc.text(this.truncate(member.division, 14), x + pad, y + 4, {
      width: colWidths.division - pad * 2,
    });
    x += colWidths.division;

    // Category
    doc.text(member.bowCategory || '-', x + pad, y + 4, {
      width: colWidths.category - pad * 2,
    });
    x += colWidths.category;

    // Role: icon + 8px gap + text (right-aligned)
    if (role) {
      const iconPath = role === 'Leader' ? crownPath : balancePath;
      try {
        doc.image(iconPath, x + pad, y + (this.ROW_HEIGHT - iconSize) / 2, {
          width: iconSize,
          height: iconSize,
        });
      } catch {
        // ignore if icon missing
      }
      doc
        .fontSize(7)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text(role, x + pad + iconSize + iconGap, y + 5, {
          width: colWidths.role - pad - iconSize - iconGap - pad,
          align: 'right',
        });
    }

    doc.y = y + this.ROW_HEIGHT;
  }

  /**
   * Truncate text to fit column
   */
  private truncate(text: string, maxLen: number): string {
    if (!text) return '-';
    return text.length > maxLen ? text.substring(0, maxLen - 2) + '..' : text;
  }

  /**
   * Generate PDF with score cards - 4 cards per A4 page (2x2), cut lines in center
   */
  async generateScoreCardsPdf(
    tournamentName: string,
    location: string,
    date: string,
    patrols: GeneratedPatrol[],
    entries: PatrolEntry[],
    scoreConfig: ScoreCardConfig = { arrowsPerEnd: 6, endsCount: 12 },
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const padding = 20;
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: padding,
            bottom: padding,
            left: padding,
            right: padding,
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        const pageW = doc.page.width;
        const pageH = doc.page.height;
        const cardW = (pageW - 2 * padding) / 2;
        const cardH = (pageH - 2 * padding) / 2;
        const centerX = padding + cardW;
        const centerY = padding + cardH;

        const sortedPatrols = [...patrols].sort(
          (a, b) => a.targetNumber - b.targetNumber,
        );

        const cards: Array<{
          targetNumber: number;
          entry: PatrolEntry;
          role: string;
        }> = [];
        for (const patrol of sortedPatrols) {
          const members = [...patrol.members].sort((a, b) => {
            if (a === patrol.leaderId) return -1;
            if (b === patrol.leaderId) return 1;
            const aIsJudge = patrol.judgeIds.includes(a);
            const bIsJudge = patrol.judgeIds.includes(b);
            if (aIsJudge && !bIsJudge) return -1;
            if (!aIsJudge && bIsJudge) return 1;
            return 0;
          });

          for (const memberId of members) {
            const entry = entries.find((e) => e.participantId === memberId);
            if (!entry) continue;
            const isLeader = patrol.leaderId === memberId;
            const isJudge = patrol.judgeIds.includes(memberId);
            cards.push({
              targetNumber: patrol.targetNumber,
              entry,
              role: isLeader ? 'Leader' : isJudge ? 'Judge' : '',
            });
          }
        }

        const crownPath = path.join(process.cwd(), 'pdf/icons/crown.png');
        const balancePath = path.join(process.cwd(), 'pdf/icons/balance.png');

        const totalPages = Math.ceil(cards.length / 4);
        for (let pageNum = 0; pageNum < totalPages; pageNum++) {
          if (pageNum > 0) {
            doc.addPage();
          }
          // Cut lines: one horizontal and one vertical in the middle
          doc.strokeColor('#999999').lineWidth(0.5);
          doc
            .moveTo(centerX, padding)
            .lineTo(centerX, pageH - padding)
            .stroke();
          doc
            .moveTo(padding, centerY)
            .lineTo(pageW - padding, centerY)
            .stroke();

          for (let pos = 0; pos < 4; pos++) {
            const i = pageNum * 4 + pos;
            if (i >= cards.length) break;
            const col = pos % 2;
            const row = Math.floor(pos / 2);
            const x = padding + col * cardW;
            const y = padding + row * cardH;

            this.drawScoreCard(
              doc,
              tournamentName,
              location,
              date,
              cards[i].targetNumber,
              cards[i].entry,
              cards[i].role,
              x,
              y,
              cardW,
              cardH,
              scoreConfig,
              crownPath,
              balancePath,
            );
          }
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Draw a single score card (A5 quadrant)
   */
  private drawScoreCard(
    doc: PDFKit.PDFDocument,
    tournamentName: string,
    location: string,
    date: string,
    targetNumber: number,
    entry: PatrolEntry,
    role: string,
    x: number,
    y: number,
    cardW: number,
    cardH: number,
    scoreConfig: ScoreCardConfig,
    crownPath: string,
    balancePath: string,
  ): void {
    const pad = 6;
    const tagPad = 4;
    const tagRadius = 3;

    doc.save();
    doc.y = y;

    // Header: patrol # in rounded square, archer name, role in rounded square (with icon)
    const headerY = y + pad;
    const tagH = 14;

    // Patrol number tag (rounded square, no color bg)
    this.drawRoundedTag(
      doc,
      `#${targetNumber}`,
      x + pad,
      headerY,
      28,
      tagH,
      tagRadius,
      tagPad,
    );
    let nameX = x + pad + 28 + 6;

    // Role tag with icon (if any)
    if (role) {
      const iconSize = 10;
      const iconPath = role === 'Leader' ? crownPath : balancePath;
      try {
        doc.image(iconPath, nameX, headerY + (tagH - iconSize) / 2, {
          width: iconSize,
          height: iconSize,
        });
      } catch {
        // ignore if icon missing
      }
      const roleW = role === 'Leader' ? 42 : 38;
      this.drawRoundedTag(
        doc,
        role,
        nameX + iconSize + 2,
        headerY,
        roleW,
        tagH,
        tagRadius,
        tagPad,
      );
      nameX += iconSize + 2 + roleW + 6;
    }

    // Archer name
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000');
    doc.text(entry.name, nameX, headerY + (tagH - 10) / 2, {
      width: cardW - (nameX - x) - pad,
    });

    // Subtitle: tournament name
    const subY = headerY + tagH + 6;
    doc.font('Helvetica').fontSize(9).fillColor('#333333');
    doc.text(tournamentName, x + pad, subY, { width: cardW - 2 * pad });

    // Location and date
    const locY = subY + 12;
    doc.fontSize(8).fillColor('#555555');
    const locDate = [location, date].filter(Boolean).join(' • ');
    doc.text(locDate || '-', x + pad, locY, { width: cardW - 2 * pad });

    // Info subtables (Club, Division, Category)
    const infoY = locY + 14;
    const infoRowH = 10;
    const infoColW = (cardW - 2 * pad) / 3;
    const infoLabels = ['Club', 'Division', 'Category'];
    const infoValues = [entry.club, entry.division, entry.bowCategory];
    doc.font('Helvetica').fontSize(7).fillColor('#000000');
    doc.strokeColor('#cccccc').lineWidth(0.3);
    for (let k = 0; k < 3; k++) {
      const cx = x + pad + k * infoColW;
      doc.rect(cx, infoY, infoColW, infoRowH * 2).stroke();
      doc.font('Helvetica-Bold').text(infoLabels[k], cx + 2, infoY + 2, {
        width: infoColW - 4,
      });
      doc
        .font('Helvetica')
        .text(infoValues[k] || '-', cx + 2, infoY + infoRowH + 2, {
          width: infoColW - 4,
        });
    }

    // Score table
    const gridTop = infoY + 2 * infoRowH + 8;
    const arrows = scoreConfig.arrowsPerEnd;
    const ends = scoreConfig.endsCount;
    const rowH = 12;
    const endColW = 18;
    const arrowColW = Math.min(22, (cardW - 2 * pad - endColW - 50) / arrows);
    const totalColW = 44;

    // Header row
    doc.fontSize(7).font('Helvetica-Bold');
    doc.text('End', x + pad, gridTop, { width: endColW });
    let gx = x + pad + endColW;
    for (let a = 1; a <= arrows; a++) {
      doc.text(String(a), gx, gridTop, { width: arrowColW });
      gx += arrowColW;
    }
    doc.text('Total', gx, gridTop, { width: totalColW });

    // Data rows with borders
    doc.font('Helvetica');
    for (let e = 1; e <= ends; e++) {
      const rowY = gridTop + (e - 1) * rowH + 10;
      doc.text(String(e), x + pad, rowY + (rowH - 8) / 2, { width: endColW });
      gx = x + pad + endColW;
      for (let a = 0; a < arrows; a++) {
        doc.rect(gx, rowY, arrowColW, rowH).stroke();
        gx += arrowColW;
      }
      doc.rect(gx, rowY, totalColW, rowH).stroke();
    }

    // Divider (no borders) + Total sum row: "Total sum:" right-aligned, last col with border
    const dividerY = gridTop + ends * rowH + 10;
    const totalRowY = dividerY + 4;

    doc.fontSize(8).font('Helvetica');
    doc.text('Total sum:', x + pad + endColW, totalRowY + (rowH - 8) / 2, {
      width: arrows * arrowColW,
      align: 'right',
    });
    // End cell (empty), arrow cells (Total sum text), Total cell (with border)
    doc.rect(x + pad, totalRowY, endColW, rowH).stroke();
    doc.rect(x + pad + endColW, totalRowY, arrows * arrowColW, rowH).stroke();
    doc
      .rect(x + pad + endColW + arrows * arrowColW, totalRowY, totalColW, rowH)
      .stroke();

    doc.restore();
  }

  private drawRoundedTag(
    doc: PDFKit.PDFDocument,
    text: string,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    pad: number,
  ): void {
    doc.strokeColor('#333333').lineWidth(0.5);
    doc.roundedRect(x, y, w, h, r).stroke();
    doc.fillColor('#000000').fontSize(8).font('Helvetica');
    doc.text(text, x + pad, y + (h - 8) / 2, { width: w - 2 * pad });
  }
}
