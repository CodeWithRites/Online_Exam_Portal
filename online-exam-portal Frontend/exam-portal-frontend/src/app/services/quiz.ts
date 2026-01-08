import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private baseUrl = 'http://localhost:8082/api/quiz';

  constructor(private http: HttpClient) {}

  getAllQuizzes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/all`);
  }

  getPublicQuizzes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/public/all`);
  }

  createQuiz(quiz: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, quiz);
  }

  deleteQuiz(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }

  getQuizById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }
}
