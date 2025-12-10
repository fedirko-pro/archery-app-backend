import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import {
  GeneratedPatrol,
  PatrolEntry,
} from './interfaces/patrol-generation.interface';

@Injectable()
export class PatrolPdfService {
  // Table column widths
  private readonly COL_PATROL = 50;
  private readonly COL_NAME = 140;
  private readonly COL_CLUB = 100;
  private readonly COL_DIVISION = 80;
  private readonly COL_CATEGORY = 50;
  private readonly COL_ROLE = 50;
  private readonly ROW_HEIGHT = 18;
  private readonly HEADER_HEIGHT = 22;

  /**
   * Generate PDF for patrol list as a continuous table
   */
  async generatePatrolListPdf(
    tournamentName: string,
    bowCategoryName: string,
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
          .text(`Patrol List | ${date}`, { align: 'center' });

        doc.moveDown(1);

        // Draw table header
        this.drawTableHeader(doc);

        // Sort patrols by target number
        const sortedPatrols = [...patrols].sort(
          (a, b) => a.targetNumber - b.targetNumber,
        );

        // Draw each patrol section
        for (const patrol of sortedPatrols) {
          this.drawPatrolSection(doc, patrol, entries);
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

  /**
   * Draw table header
   */
  private drawTableHeader(doc: PDFKit.PDFDocument): void {
    const startX = 30;
    let x = startX;
    const y = doc.y;

    // Background
    doc.rect(startX, y, 535, this.HEADER_HEIGHT).fill('#e0e0e0');

    // Header text
    doc.fillColor('#000000').fontSize(9).font('Helvetica-Bold');

    doc.text('Patrol', x + 5, y + 6, { width: this.COL_PATROL });
    x += this.COL_PATROL;

    doc.text('Name', x + 5, y + 6, { width: this.COL_NAME });
    x += this.COL_NAME;

    doc.text('Club', x + 5, y + 6, { width: this.COL_CLUB });
    x += this.COL_CLUB;

    doc.text('Division', x + 5, y + 6, { width: this.COL_DIVISION });
    x += this.COL_DIVISION;

    doc.text('Cat.', x + 5, y + 6, { width: this.COL_CATEGORY });
    x += this.COL_CATEGORY;

    doc.text('Role', x + 5, y + 6, { width: this.COL_ROLE });

    doc.y = y + this.HEADER_HEIGHT;
  }

  /**
   * Draw a patrol section with all members
   */
  private drawPatrolSection(
    doc: PDFKit.PDFDocument,
    patrol: GeneratedPatrol,
    entries: PatrolEntry[],
  ): void {
    const members = patrol.members;
    const startX = 30;

    // Check if we need a new page
    const sectionHeight = members.length * this.ROW_HEIGHT + 8;
    if (doc.y + sectionHeight > doc.page.height - 60) {
      doc.addPage();
      this.drawTableHeader(doc);
    }

    // Patrol separator line
    doc
      .strokeColor('#999999')
      .moveTo(startX, doc.y)
      .lineTo(startX + 535, doc.y)
      .stroke();

    // Draw each member row
    members.forEach((memberId, index) => {
      const member = entries.find((e) => e.participantId === memberId);
      if (!member) return;

      const isLeader = patrol.leaderId === memberId;
      const isJudge = patrol.judgeIds.includes(memberId);
      const role = isLeader ? 'Leader' : isJudge ? 'Judge' : '';

      // Alternate row background
      if (index % 2 === 0) {
        doc.rect(startX, doc.y, 535, this.ROW_HEIGHT).fill('#f9f9f9');
      }

      this.drawMemberRow(doc, patrol.targetNumber, member, role, index === 0);
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
  ): void {
    const startX = 30;
    let x = startX;
    const y = doc.y;

    doc.fillColor('#000000').fontSize(8).font('Helvetica');

    // Patrol number (only for first member)
    if (showPatrolNumber) {
      doc.font('Helvetica-Bold').text(`#${patrolNumber}`, x + 5, y + 4, {
        width: this.COL_PATROL,
      });
    }
    x += this.COL_PATROL;

    // Name
    doc.font('Helvetica').text(this.truncate(member.name, 22), x + 5, y + 4, {
      width: this.COL_NAME,
    });
    x += this.COL_NAME;

    // Club
    doc.text(this.truncate(member.club, 16), x + 5, y + 4, {
      width: this.COL_CLUB,
    });
    x += this.COL_CLUB;

    // Division
    doc.text(this.truncate(member.division, 12), x + 5, y + 4, {
      width: this.COL_DIVISION,
    });
    x += this.COL_DIVISION;

    // Category
    doc.text(member.bowCategory || '-', x + 5, y + 4, {
      width: this.COL_CATEGORY,
    });
    x += this.COL_CATEGORY;

    // Role
    if (role) {
      doc
        .font('Helvetica-Bold')
        .fillColor(role === 'Leader' ? '#1976d2' : '#9c27b0')
        .text(role, x + 5, y + 4, { width: this.COL_ROLE });
      doc.fillColor('#000000');
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
}
