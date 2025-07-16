import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, mapTo, switchMap } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { ApiResponse } from '../models/api-response.model';
import { ModalService } from '../../main/services/modal.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly _baseUrl = 'http://localhost:3002/bp/products';

  constructor(
    private readonly _http: HttpClient,
    private readonly _modalSvc: ModalService
  ) { }

  getProducts(): Observable<Product[]> {
    return this._http.get<ApiResponse<Product[]>>(this._baseUrl).pipe(
      map(res => res.data ?? []),
      catchError(this.handleError)
    );
  }

  getIdExists(id: string): Observable<boolean> {
    return this._http.get<boolean>(`${this._baseUrl}/verification/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createProduct(product: Product): Observable<ApiResponse<Product>> {
    return this.handleResponse(
      this._http.post<ApiResponse<Product>>(this._baseUrl, product)
    );
  }

  readProduct(id: string): Observable<Product | null> {
    const url = `${this._baseUrl}/${id}`;
    return this._http.get<Product>(url).pipe(
      catchError(this.handleError)
    );
  }

  updateProduct(id: string, product: Omit<Product, 'id'>): Observable<ApiResponse<Product>> {
    return this.handleResponse(
      this._http.put<ApiResponse<Product>>(`${this._baseUrl}/${id}`, product),
      'Producto actualizado correctamente'
    );
  }

  deleteProduct(id: string): Observable<ApiResponse<null>> {
    const req$ = this._http.delete<ApiResponse<null>>(`${this._baseUrl}/${id}`);
    return this.handleResponse(req$);
  }


  private handleError(error: HttpErrorResponse) {
    const apiError = {
      name: error.error?.name || 'UnknownError',
      message: error.error?.message || 'Unexpected error occurred.',
      errors: error.error?.errors || null
    };
    return throwError(() => apiError);
  }


  private handleResponse<T>(obs$: Observable<T>, successMessage = 'Operación completada'): Observable<T> {
    return obs$.pipe(
      switchMap((res: T) =>
        this._modalSvc.open({
          title: successMessage,
          confirmTitle: 'OK',
          type: 'Success'
        }).pipe(mapTo(res))
      ),
      catchError((error: HttpErrorResponse) => {
        const errMsg = error.error?.message || 'Ha ocurrido un error inesperado';
        return this._modalSvc.open({
          title: `Error: ${errMsg}`,
          confirmTitle: 'OK',
          type: 'Error'
        }).pipe(
          switchMap(() => throwError(() => error))
        );
      })
    );
  }

}
