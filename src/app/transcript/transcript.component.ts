import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink} from "@angular/router";
import {NgForOf, NgIf} from "@angular/common";
import {StudentCourseData} from "../models/StudentData";
import {courseData, getStudentByRollNumber} from "../CourseData";
import {Attendance, CourseCategory, Grade, Semester} from "../models/Semester";
import {calculateCGPA} from "../helper/calculateCGP";
import {calculateGPA} from "../helper/calculateGPA";
import {PdfGeneratorComponent} from "../pdf-generator/pdf-generator.component"

export interface SemesterPair{
  odd:Semester;
  even:Semester|null;
}
@Component({
  selector: 'app-transcript',
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    NgForOf,
    PdfGeneratorComponent
  ],
  templateUrl: './transcript.component.html',
  styleUrl: './transcript.component.css'
})

export class TranscriptComponent implements OnInit {
  protected student: StudentCourseData | undefined;
  oddSemesters: Semester[] = [];
  evenSemesters: Semester[] = [];
  protected readonly courseData = courseData;
  protected readonly Attendance = Attendance;
  protected readonly Grade = Grade;
  protected semestersDone: number | undefined = 0;
  protected gpaList: number[] = [];
  protected readonly Category = CourseCategory;
  protected readonly CourseCategory = CourseCategory;
  protected semesterPairs: SemesterPair[] = [];

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const rollNumber = params['rollNumber'];
      if (rollNumber) {
        this.student = getStudentByRollNumber(Number(rollNumber));
        this.separateSemesters(this.student?.semestersPassed)
        calculateCGPA(this.student)
        this.semestersDone = this.student?.semestersPassed.length;
        if (this.semestersDone != undefined) {
          for (let i = 0; i < this.semestersDone; i++) {
            this.gpaList[i] = calculateGPA(this.student, i + 1);
          }
        }
      }
    });
  }

  separateSemesters(semesters: Semester[] | undefined): void {
    if (semesters == undefined) return;
    this.oddSemesters = semesters.filter(sem => sem.semesterID % 2 !== 0);
    this.evenSemesters = semesters.filter(sem => sem.semesterID % 2 === 0);
    this.semesterPairs = this.oddSemesters.map((odd, index): SemesterPair => ({
      odd,
      even: this.evenSemesters[index] || null
    }));
  }
}
