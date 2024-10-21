import { Component, Input } from '@angular/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {Attendance, CourseCategory, Grade, Semester} from "../models/Semester";
import {SemesterPair} from "../transcript/transcript.component";
import {StudentCourseData} from "../models/StudentData";
import {NgClass, NgStyle} from "@angular/common";

@Component({
  selector: 'app-pdf-generator',
  standalone: true,
  templateUrl: './pdf-generator.component.html',
  imports: [
    NgClass,
    NgStyle
  ],
})
export class PdfGeneratorComponent {
  @Input() semesterPairs!: SemesterPair[];
  @Input() student!: StudentCourseData;
  @Input() gpaList!: number[];
  protected date : Date = new Date();
  protected issuedDate : string=this.getFormattedDate();
  getFormattedDate(): string {

    const day = this.date.getDate().toString().padStart(2, '0');
    const month = (this.date.getMonth() + 1).toString().padStart(2, '0');
    const year = this.date.getFullYear().toString();

    return `${day}-${month}-${year}`; // in dd-mm-yyyy format
  }

  generatePDF() {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageHeight = doc.internal.pageSize.height;
    let currentY = 20;

    // Title and student details
    doc.setFontSize(18);
    doc.text('TRANSCRIPT', 105, currentY, { align: 'center' });
    currentY += 10;
    doc.setFontSize(9);
    doc.text(`Name: ${this.student.name}`, 14, currentY);
    doc.text(`Roll Number: ${this.student.rollNumber}`, 105, currentY);
    currentY += 7;
    doc.text(`Department: ${this.student.department}`, 14, currentY);
    doc.text(`Total Credits: ${this.student.totalCredits}`, 105, currentY);
    currentY += 7;
    doc.text(`USID: ${this.student.id}`, 14, currentY);
    currentY += 10;

    // Semester side by side printing
    this.semesterPairs.forEach((pair) => {

      const oddTableHeightEstimate = this.getTableHeightEstimate(pair.odd);
      const evenTableHeightEstimate = pair.even ? this.getTableHeightEstimate(pair.even) : 0;
      const tableHeightEstimate = Math.max(oddTableHeightEstimate, evenTableHeightEstimate);

      // Add new page
      if (currentY + tableHeightEstimate > pageHeight) {
        doc.addPage(); // Start a new page
        currentY = 20;  // Reset Y position
      }

      const startY = currentY;

      // Odd Semester (Left Side)
      doc.setFontSize(9);
      doc.text(`Semester ${pair.odd.semesterID}`, 14, startY);
      (doc as any).autoTable({
        head: [['Sno.', 'Course Code', 'Course Name', 'Category', 'Credits', 'Grade', 'Attendance']],
        body: this.getTableData(pair.odd),
        startY: startY + 5,
        theme: 'striped',
        margin: { left: 14 },
        tableWidth: 90,
        columnStyles: {
          0: { cellWidth: 7},
          1: { cellWidth: 12 },
          2: { cellWidth: 25 },
          3: { cellWidth: 12 },
          4: { cellWidth: 10 },
          5: { cellWidth: 10 },
          6: { cellWidth: 14 },
        },
        headStyles: { fillColor: [255, 255, 255], fontSize: 6,  textColor: [0,0,0] },
        bodyStyles: { fontSize: 7 },
        styles: {
          cellPadding: 1
        }
      });

      const oddTableHeight = (doc as any).lastAutoTable.finalY;

      // Even Semester
      if (pair.even) {
        const evenTableStartY = startY;
        doc.setFontSize(9);
        doc.text(`Semester ${pair.even.semesterID}`, 105, evenTableStartY);
        (doc as any).autoTable({
          head: [['Sno.', 'Course Code', 'Course Name', 'Category', 'Credits', 'Grade', 'Attendance']],
          body: this.getTableData(pair.even),
          startY: evenTableStartY + 5,
          theme: 'striped',
          margin: { left: 105 },
          tableWidth: 90,
          columnStyles: {
            0: { cellWidth: 7},
            1: { cellWidth: 12 },
            2: { cellWidth: 25 },
            3: { cellWidth: 12 },
            4: { cellWidth: 10 },
            5: { cellWidth: 10 },
            6: { cellWidth: 14},
          },
          headStyles: { fillColor: [255, 255, 255], fontSize: 6, textColor: [0,0,0] },
          bodyStyles: { fontSize: 7 },
          styles: {
            cellPadding: 1
          }
        });

        const evenTableHeight = (doc as any).lastAutoTable.finalY;


        currentY = Math.max(oddTableHeight, evenTableHeight) + 10;
      } else {
        currentY = oddTableHeight + 10;
      }
    });

    const tableBody = [
      ['Semester', 1, 2, 3, 4, 5, 6, 7, 8],
      ['Total Credits', ...this.student.semestersPassed.map(sem => sem.requiredCredits)],
      ['Earned Credits', ...this.student.semestersPassed.map(sem => sem.earnedCredits)],
      ['GPA', ...this.gpaList],
      ['CGPA', ...this.student.semestersPassed.map(sem => sem.cgpa)],
    ];
    (doc as any).autoTable({
      body: tableBody,
      startY: currentY,
      theme: 'plain',
      margin: { left: 14 },
      tableWidth: 'auto',
      styles: {
        fontSize: 8,
        cellPadding: 1,
        lineWidth: 0.2,
        lineColor: [0, 0, 0],
        halign: 'center',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineWidth: 0.2,
      },
      bodyStyles: { fontSize: 8 },
    });
    currentY+=35
    doc.setFontSize(10);
    doc.text(`Date of Issue: ${this.issuedDate}`, 14, currentY, );
    currentY += 7;
    doc.text('Place of Issue: IIT Palakkad', 14, currentY,);
    currentY += 7;
    doc.text('Issuing Authority: Office In-Charge, Academics', 14, currentY,);
    currentY += 10;

// Starting the info on a new page
    doc.addPage();
    currentY = 20;
    doc.setFont('Times', 'normal');
    doc.setFontSize(14);
    doc.text('Grade and Grading Procedure', 14, currentY);
    currentY += 7;
    doc.setFontSize(10);
    doc.text(
      'Based on the performance in a registered course, each student is awarded a final letter grade at the end of the semester. ' +
      'The letter grades and the corresponding grade points are as follows:',
      14,
      currentY,
      { maxWidth: 180 }
    );
    currentY += 9;
    (doc as any).autoTable({
      head: [['Grade', 'Grade Points', 'Remarks', 'Grade', 'Grade Points', 'Remarks']],
      body: [
        ['S', '10', 'Outstanding', 'U', '0', 'Failure due to insufficient attendance'],
        ['A', '9', 'Excellent', 'W', '0', 'Failure due to withdrawal'],
        ['B', '8', 'Very Good', 'Y', '0', 'Course yet to be completed'],
        ['C', '7', 'Good', 'N', '0', 'Audit; no grades'],
        ['D', '6', 'Average', '', '', ''],
        ['E', '4', 'Marginal', '', '', ''],
      ],
      startY: currentY,
      theme: 'plain',
      margin: { left: 14 },
      tableWidth: 'auto',
      headStyles: { fillColor: [255, 255, 255], fontSize: 6,  textColor: [0,0,0] },  // Slightly larger font for headers
      styles: {
        fontSize: 8,
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
        fillColor: null,
      },
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(
      'Letter grade U or W implies failure in the course.' +
      'The Grade Point Average (GPA) in each semester is calculated according to the formula:',
      14, currentY,
      { maxWidth: 180 }
    );
    doc.setFontSize(10);
    doc.setFont('Times-roman', 'bold');
    doc.text(
      'GPA = \u{03A3}(Ci x GPi) / \u{03A3}(Ci)',
      doc.internal.pageSize.getWidth() / 2, currentY + 10,
      { align: 'center' }
    );

    doc.setFont('times', 'normal');
    currentY += 15;
    doc.text(
      'where Ci and GPi are the number of credits and the grade points obtained in the ith course taken during the ' +
      'semester, including those in which the student has secured U and W grades.' +
      'In the case of Cumulative Grade Point Average (CGPA), the credits Ci of all the courses taken in all the ' +
      'semesters until that point in time are considered in the above formula. CGPA at any point in time is calculated ' +
      'based on all the core courses taken by the student until that time (including those in which the student gets a fail ' +
      'grade) and all the elective courses successfully completed by the student until that time (excluding those in ' +
      'which the student gets a fail grade).' +
      'The additional courses taken, if any, are awarded grades but not counted towards ' +
      'GPA/CGPA calculations. CGPA to Percentage conversion formula:',
      14, currentY,
      { maxWidth: 180 }
    );
    currentY += 30;
    doc.setFont('times', 'bold');
    doc.text(
      'Percentage of Marks = (10 x CGPA) - 5',
      doc.internal.pageSize.getWidth() / 2, currentY,
      { align: 'center' }
    );

    doc.setFont('times', 'normal');
    currentY += 7;
    doc.text(
      'The additional courses audited, if any, are awarded grades but not counted towards ' +
      'GPA/CGPA calculations. The medium of instruction of courses is English',
      14, currentY,
      { maxWidth: 180 }
    );
    currentY +=15
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text('Abbreviations for Course Categories', 14, currentY);
    currentY += 10;
    doc.setFontSize(10);
    const abbreviations = [
      'BET: Basic Engineering Theory', 'BEP: Basic Engineering Practice',
      'BST: Basic Science Theory', 'BSP: Basic Science Practice',
      'PMT: Professional Major Theory', 'PMP: Professional Major Practice',
      'GCE: General Category Elective', 'PME: Professional Major Elective',
      'HSE: Humanities Elective', 'MAE: Mathematics Elective',
      'IDC: Interdisciplinary Course', 'CWC: Course Without Credit'
    ];
    const xLeft = 14;
    const xRight = 105;
    abbreviations.forEach((abbreviation, index) => {

      if (currentY + 7 > pageHeight) {
        doc.addPage();
        currentY = 20;
      }
      if (index % 2 === 0) {

        doc.setFont('times', 'normal');
        doc.text(abbreviation, xLeft, currentY);
      } else {
        doc.setFont('times', 'normal');
        doc.text(abbreviation, xRight, currentY);
        currentY += 5;
      }
    });


    if (abbreviations.length % 2 !== 0) {
      currentY += 5;
    }
    currentY += 10

    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text('Attendance Grade', 105, currentY, { align: 'center' });
    currentY += 7;
    (doc as any).autoTable({
      head: [['Attendance Rounded to', 'Remarks', 'Code']],
      body: [
        ['>= 95%', 'Very Good', 'VG'],
        ['85% to 94%', 'Good', 'G'],
        ['< 85%', 'Poor', 'P']
      ],
      startY: currentY,
      theme: 'plain',
      margin: { left: doc.internal.pageSize.getWidth() * 0.3, right: doc.internal.pageSize.getWidth() * 0.3 },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineWidth: 0.2,
        lineColor: [0, 0, 0],
        halign: 'center',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineWidth: 0.2,
      },
      bodyStyles: { fontSize: 8 },
    });

    doc.save('transcript.pdf');
  }

  getTableData(semester: Semester) {
    return semester.courses.map((course, index) => [
      index + 1,
      course.courseID,
      course.courseTitle,
      CourseCategory[course.category],
      course.credits,
      Grade[course.grade],
      Attendance[course.attendance]
    ]);
  }

  getTableHeightEstimate(semester: Semester): number {
    const rowHeight = 8;
    const numberOfRows = semester.courses.length;
    const tablePadding = 10;
    return (numberOfRows * rowHeight) + tablePadding;
  }

}


