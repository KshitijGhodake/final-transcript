import { Component, OnInit } from '@angular/core';
import { studentData } from "../CourseData";
import { NgClass, NgFor, NgIf } from "@angular/common";
import { Student } from "../models/Student";
import { FormsModule } from "@angular/forms";
import { RouterOutlet, RouterLink, Router } from "@angular/router";
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [NgFor, FormsModule, NgIf, NgClass, RouterOutlet, RouterLink],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.css'
})
export class StudentListComponent implements OnInit {

  protected readonly studentData = studentData;
  filteredStudentData: Student[] = [];
  searchText: string = '';
  searchSubject: Subject<string> = new Subject<string>();
  protected selectedDepartment: string = '';
  selectedStudent: number | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // apply debounceTime and distinctUntilChanged
    this.searchSubject.pipe(
      debounceTime(200),
      distinctUntilChanged()
    ).subscribe(searchText => {
      this.filterData(searchText);
    });

    this.filteredStudentData = [];
  }

  onSearchTextChange(newSearchText: string): void {
    this.searchText = newSearchText;
    if(this.searchText==''){
      return;
    }
    this.searchSubject.next(this.searchText);
  }

  filterData(searchText: string): void {
    if(searchText==''){
      return
    }
    if (!searchText.trim()) {
      this.filteredStudentData = [...this.studentData];
      return;
    }

    searchText = searchText.toLowerCase();
    this.filteredStudentData = this.studentData.filter(student => {
      return (
        student.name.toLowerCase().includes(searchText) ||
        student.rollNumber.toString().includes(searchText) ||
        student.department.toLowerCase().includes(searchText)
      );
    });
  }

  filterByDepartment(): void {
    if (this.selectedDepartment) {
      this.filteredStudentData = this.studentData.filter(student =>
        student.department === this.selectedDepartment
      );
    } else {
      this.filteredStudentData = [...this.studentData];
    }
  }

  selectStudent(index: number): void {
    this.selectedStudent = index;
  }

  generateNext(student: Student) {
    this.router.navigate(['/transcript'], { queryParams: { rollNumber: student.rollNumber } });
  }

  /* Feature to make '/' focus on search */
  // @HostListener('window:keydown', ['$event'])
  // handleKeyDown(event: KeyboardEvent) {
  //   // If '/' key is pressed
  //   if (event.key === '/') {
  //     event.preventDefault(); // Prevent default behavior of the '/' key
  //     this.focusOnSearchBar(); // Focus on the search bar
  //   }
  // }
  // focusOnSearchBar() {
  //   const searchBar = document.getElementById('searchBar') as HTMLInputElement;
  //   if (searchBar) {
  //     searchBar.focus();
  //   }
  // }
}
