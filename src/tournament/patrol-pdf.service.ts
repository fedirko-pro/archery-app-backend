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
    scoreConfig: ScoreCardConfig = { arrowsPerEnd: 5, endsCount: 20 },
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const padding = 10;
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
          // Cut lines: one horizontal and one vertical (A4 → A5)
          doc.strokeColor('#333333').lineWidth(1);
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
    const pad = 12;
    const tagPad = 5;
    const tagRadius = 4;

    doc.save();
    doc.y = y;

    // Header (one row): patrol # in border | user's name | icon + role in border (if any)
    const headerY = y + pad;
    const tagH = 16;
    const nameFontSize = 15;
    const headerBorderWidth = 1.2;

    // 1) Patrol number in border (align baseline with name so badge does not shift)
    const patrolW = 32;
    const patrolFontSize = 14;
    doc.strokeColor('#000000').lineWidth(headerBorderWidth);
    doc.roundedRect(x + pad, headerY, patrolW, tagH, tagRadius).stroke();
    doc.fillColor('#000000').fontSize(patrolFontSize).font('Helvetica-Bold');
    const headerBaselineY = headerY + (tagH - nameFontSize) / 2 + 2;
    doc.text(`#${targetNumber}`, x + pad, headerBaselineY, {
      width: patrolW,
      align: 'center',
    });
    const afterPatrolX = x + pad + patrolW + 6;

    // 2) Role + icon in border (only for Leader or Judge; width 58 so "Judge" doesn't wrap)
    const isLeaderOrJudge = role === 'Leader' || role === 'Judge';
    const roleW = isLeaderOrJudge ? 58 : 0;
    const roleX = x + cardW - pad - roleW;
    let nameEndX = x + cardW - pad;
    if (isLeaderOrJudge && roleW > 0) {
      doc.strokeColor('#000000').lineWidth(headerBorderWidth);
      doc.roundedRect(roleX, headerY, roleW, tagH, tagRadius).stroke();
      const iconSize = 11;
      const gap = 4;
      const iconX = roleX + tagPad;
      const textX = iconX + iconSize + gap;
      const textW = roleW - (iconSize + gap + tagPad * 2);
      const roleIconPath = role === 'Leader' ? crownPath : balancePath;
      try {
        doc.image(roleIconPath, iconX, headerY + (tagH - iconSize) / 2, {
          width: iconSize,
          height: iconSize,
        });
      } catch {
        // ignore if icon missing
      }
      doc
        .fillColor('#000000')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(role, textX, headerY + (tagH - 9) / 2, {
          width: textW,
          align: 'center',
        });
      nameEndX = roleX - 6;
    }

    // 3) User's name (centered between patrol and role)
    doc.font('Helvetica-Bold').fontSize(nameFontSize).fillColor('#000000');
    const nameWidth = nameEndX - afterPatrolX;
    doc.text(
      entry.name,
      afterPatrolX,
      headerY + (tagH - nameFontSize) / 2 + 2,
      {
        width: nameWidth,
        align: 'center',
      },
    );

    // Subtitle: tournament name (centered, bold)
    const subY = headerY + tagH + 6;
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#333333');
    doc.text(tournamentName, x + pad, subY, {
      width: cardW - 2 * pad,
      align: 'center',
    });

    // Location and date (centered)
    const locY = subY + 12;
    doc.font('Helvetica').fontSize(10).fillColor('#555555');
    const locDate = [location, date].filter(Boolean).join(' • ');
    doc.text(locDate || '-', x + pad, locY, {
      width: cardW - 2 * pad,
      align: 'center',
    });

    // Info: one row, one column per detail — [Club] [Fed. No.] [Division] [Category], each with header + value (space after location/date)
    const infoY = locY + 18;
    const infoPadH = 3;
    const infoPadV = 2;
    const infoFontSize = 10;
    const infoCellH = Math.max(8, 2 * infoPadV + infoFontSize) * 2; // header row + value row
    const infoCols = 4;
    const infoColW = (cardW - 2 * pad) / infoCols;
    const infoCells: Array<{ label: string; value: string }> = [
      { label: 'Club', value: entry.clubShortCode ?? entry.club ?? '-' },
      { label: 'Fed. No.', value: entry.federationNumber ?? '-' },
      { label: 'Division', value: entry.division || '-' },
      { label: 'Category', value: entry.bowCategory || '-' },
    ];
    doc.strokeColor('#999999').lineWidth(0.3);
    doc.font('Helvetica').fontSize(infoFontSize);
    for (let i = 0; i < infoCols; i++) {
      const cx = x + pad + i * infoColW;
      doc.rect(cx, infoY, infoColW, infoCellH).stroke();
      doc.rect(cx, infoY, infoColW, infoCellH / 2).fill('#e8e8e8');
      doc.rect(cx, infoY, infoColW, infoCellH / 2).stroke();
      doc
        .fillColor('#000000')
        .font('Helvetica-Bold')
        .text(infoCells[i].label, cx + infoPadH, infoY + infoPadV, {
          width: infoColW - 2 * infoPadH,
        });
      doc
        .fillColor('#000000')
        .font('Helvetica')
        .text(
          infoCells[i].value,
          cx + infoPadH,
          infoY + infoCellH / 2 + infoPadV,
          {
            width: infoColW - 2 * infoPadH,
          },
        );
    }

    // Score table (centered; row/header heights scale from padding + font)
    const infoBlockHeight = infoCellH;
    const gridTop = infoY + infoBlockHeight + 8;
    const arrows = scoreConfig.arrowsPerEnd;
    const ends = scoreConfig.endsCount;
    const scoreCellPadH = 3;
    const scoreCellPadV = 3;
    const scoreFontSize = 6;
    const headerRowH = Math.max(8, 2 * scoreCellPadV + scoreFontSize);
    const rowH = headerRowH;
    const endColW = 42; // wide enough for "Round" / "Target" / "End" at 10pt
    const arrowColW = Math.min(22, (cardW - 2 * pad - endColW - 50) / arrows);
    const totalColW = 44;
    const tableWidth = endColW + arrows * arrowColW + totalColW;
    const gridStartX = x + (cardW - tableWidth) / 2;
    const headerRowY = gridTop;
    const firstColLabel =
      scoreConfig.firstColumnLabel === 'Target'
        ? 'Target'
        : scoreConfig.firstColumnLabel === 'End'
          ? 'End'
          : 'Round';

    // Header row (light gray, centered text, padding)
    doc.rect(gridStartX, headerRowY, endColW, headerRowH).fill('#e8e8e8');
    doc
      .rect(gridStartX + endColW, headerRowY, arrows * arrowColW, headerRowH)
      .fill('#e8e8e8');
    doc
      .rect(
        gridStartX + endColW + arrows * arrowColW,
        headerRowY,
        totalColW,
        headerRowH,
      )
      .fill('#e8e8e8');
    doc.strokeColor('#999999').lineWidth(0.3);
    doc.rect(gridStartX, headerRowY, endColW, headerRowH).stroke();
    let gx = gridStartX + endColW;
    for (let a = 1; a <= arrows; a++) {
      doc.rect(gx, headerRowY, arrowColW, headerRowH).stroke();
      gx += arrowColW;
    }
    doc.rect(gx, headerRowY, totalColW, headerRowH).stroke();
    doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold');
    doc.text(
      firstColLabel,
      gridStartX + scoreCellPadH,
      headerRowY + scoreCellPadV,
      {
        width: endColW - 2 * scoreCellPadH,
        align: 'center',
      },
    );
    gx = gridStartX + endColW;
    for (let a = 1; a <= arrows; a++) {
      doc.text(String(a), gx + scoreCellPadH, headerRowY + scoreCellPadV, {
        width: arrowColW - 2 * scoreCellPadH,
        align: 'center',
      });
      gx += arrowColW;
    }
    doc.text('Total', gx + scoreCellPadH, headerRowY + scoreCellPadV, {
      width: totalColW - 2 * scoreCellPadH,
      align: 'center',
    });

    // Data rows (row header with gray bg, centered; cell padding)
    doc.font('Helvetica');
    for (let e = 1; e <= ends; e++) {
      const rowY = gridTop + headerRowH + (e - 1) * rowH;
      doc.rect(gridStartX, rowY, endColW, rowH).fill('#e8e8e8');
      doc.rect(gridStartX, rowY, endColW, rowH).stroke();
      doc
        .fillColor('#000000')
        .fontSize(10)
        .text(String(e), gridStartX + scoreCellPadH, rowY + scoreCellPadV, {
          width: endColW - 2 * scoreCellPadH,
          align: 'center',
        });
      doc.fillColor('#000000');
      gx = gridStartX + endColW;
      for (let a = 0; a < arrows; a++) {
        doc.rect(gx, rowY, arrowColW, rowH).stroke();
        gx += arrowColW;
      }
      doc.rect(gx, rowY, totalColW, rowH).stroke();
    }

    // Total sum row: space after colon; only last cell has border
    const dividerY = gridTop + headerRowH + ends * rowH;
    const totalRowY = dividerY + 4;

    doc.fontSize(10).font('Helvetica');
    doc.text(
      'Total sum:   ',
      gridStartX + endColW,
      totalRowY + (rowH - 8) / 2,
      {
        width: arrows * arrowColW - scoreCellPadH,
        align: 'right',
      },
    );
    doc
      .rect(
        gridStartX + endColW + arrows * arrowColW,
        totalRowY,
        totalColW,
        rowH,
      )
      .stroke();

    // Signature block: label with colon on same baseline, gap before line
    const sigBlockHeight = 18;
    const sigBlockTop = y + cardH - sigBlockHeight - pad;
    const sigLineY = sigBlockTop + 5;
    const sigLabelGap = 6;
    const sigGap = 14;
    const halfCard = cardW / 2;
    doc.font('Helvetica').fontSize(10).fillColor('#000000');
    const judgeLabelW = 34;
    const leaderLabelW = 36;
    const leftLineStart = x + pad + judgeLabelW + sigLabelGap;
    const leftLineW =
      (halfCard - pad - judgeLabelW - sigLabelGap - sigGap) * 0.9;
    const rightLineStartX = x + halfCard + sigGap;
    const rightLineStart = rightLineStartX + leaderLabelW + sigLabelGap;
    const rightLineW =
      (cardW - (rightLineStartX - x) - pad - leaderLabelW - sigLabelGap) * 0.9;

    doc.text('Judge:', x + pad, sigBlockTop, { width: judgeLabelW });
    doc
      .strokeColor('#999999')
      .lineWidth(0.4)
      .moveTo(leftLineStart, sigLineY)
      .lineTo(leftLineStart + leftLineW, sigLineY)
      .stroke();
    doc.text('Leader:', rightLineStartX, sigBlockTop, { width: leaderLabelW });
    doc
      .moveTo(rightLineStart, sigLineY)
      .lineTo(rightLineStart + rightLineW, sigLineY)
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
    fontSize: number = 8,
  ): void {
    doc.strokeColor('#333333').lineWidth(0.5);
    doc.roundedRect(x, y, w, h, r).stroke();
    doc.fillColor('#000000').fontSize(fontSize).font('Helvetica-Bold');
    doc.text(text, x + pad, y + (h - fontSize) / 2, { width: w - 2 * pad });
  }
}
