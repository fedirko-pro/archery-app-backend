import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import {
  GeneratedPatrol,
  PatrolEntry,
} from './interfaces/patrol-generation.interface';

@Injectable()
export class PatrolPdfService {
  /**
   * Generate PDF for patrol list
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
            top: 50,
            bottom: 50,
            left: 50,
            right: 50,
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
          .fontSize(20)
          .font('Helvetica-Bold')
          .text(`${tournamentName} - ${bowCategoryName}`, {
            align: 'center',
          });

        doc.moveDown(0.5);

        doc.fontSize(12).font('Helvetica').text(`Date: ${date}`, {
          align: 'center',
        });

        doc.moveDown(2);

        // Generate each patrol
        for (const patrol of patrols) {
          // Patrol header
          this.drawSeparator(doc);
          doc
            .fontSize(16)
            .font('Helvetica-Bold')
            .text(
              `PATROL ${patrol.targetNumber} (Target #${patrol.targetNumber})`,
              {
                align: 'center',
              },
            );
          this.drawSeparator(doc);

          doc.moveDown(0.5);

          // Find leader and judges
          const leader = entries.find(
            (e) => e.participantId === patrol.leaderId,
          );
          const judge1 = entries.find(
            (e) => e.participantId === patrol.judgeIds[0],
          );
          const judge2 = entries.find(
            (e) => e.participantId === patrol.judgeIds[1],
          );

          // Leader
          doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text(`Leader: `, { continued: true })
            .font('Helvetica')
            .text(
              `${leader?.name || 'Unknown'} (${leader?.club || 'No Club'})`,
            );

          // Judges
          doc
            .font('Helvetica-Bold')
            .text(`Judges: `, { continued: true })
            .font('Helvetica')
            .text(
              `${judge1?.name || 'Unknown'} (${judge1?.club || 'No Club'}), ${judge2?.name || 'Unknown'} (${judge2?.club || 'No Club'})`,
            );

          doc.moveDown(0.5);

          // Members
          doc.fontSize(12).font('Helvetica-Bold').text('Members:');

          doc.moveDown(0.3);

          patrol.members.forEach((memberId, index) => {
            const member = entries.find((e) => e.participantId === memberId);
            if (member) {
              doc
                .fontSize(11)
                .font('Helvetica')
                .text(
                  `${index + 1}. ${member.name} - ${member.club} - ${member.division} - ${member.gender.toUpperCase()}`,
                );
            }
          });

          doc.moveDown(2);

          // Page break after each patrol (except last one)
          if (patrol !== patrols[patrols.length - 1]) {
            doc.addPage();
          }
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Draw a separator line
   */
  private drawSeparator(doc: PDFKit.PDFDocument): void {
    const y = doc.y;
    doc
      .moveTo(50, y)
      .lineTo(doc.page.width - 50, y)
      .stroke();
    doc.moveDown(0.5);
  }
}
