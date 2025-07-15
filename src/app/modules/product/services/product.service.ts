import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly _baseUrl = 'http://localhost:3002/bp/products';

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(this._baseUrl).pipe(
      map(res => res.data ?? []),
      catchError(this.handleError)
    );
  }

  getIdExists(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this._baseUrl}/verification/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createProduct(product: Product): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(this._baseUrl, product).pipe(
      catchError(this.handleError)
    );
  }

  updateProduct(id: string, product: Omit<Product, 'id'>): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this._baseUrl}/${id}`, product).pipe(
      catchError(this.handleError)
    );
  }

  deleteProduct(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this._baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    const apiError = {
      name: error.error?.name || 'UnknownError',
      message: error.error?.message || 'Unexpected error occurred.',
      errors: error.error?.errors || null
    };
    return throwError(() => apiError);
  }
}
