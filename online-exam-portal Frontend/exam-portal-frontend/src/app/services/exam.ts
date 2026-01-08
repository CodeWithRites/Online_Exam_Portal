import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private baseUrl = 'http://localhost:8082/api/exam';

  constructor(private http: HttpClient) {}

  getAllExams(): Observable<any> {
    return this.http.get(`${this.baseUrl}/all`);
  }

  getPublicExams(): Observable<any> {
    return this.http.get(`${this.baseUrl}/public/all`);
  }

  createExam(exam: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, exam);
  }

  deleteExam(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }

  getExamById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }
}
