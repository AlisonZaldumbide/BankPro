import { TestBed } from '@angular/core/testing';
import { ProductService } from './product.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ModalService } from '../../main/services/modal.service';
import { Product } from '../models/product.model';
import { ApiResponse } from '../models/api-response.model';
import { of, throwError } from 'rxjs';

const mockModalService = {
  open: jest.fn()
};

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ProductService,
        { provide: ModalService, useValue: mockModalService }
      ]
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should retrieve products via GET', () => {
    const mockData: Product[] = [{ id: '1', name: 'Product', description: 'Desc', logo: '', date_release: '', date_revision: '' }];

    service.getProducts().subscribe(products => {
      expect(products.length).toBe(1);
      expect(products[0].name).toBe('Product');
    });

    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockData } as ApiResponse<Product[]>);
  });

  it('should return boolean from getIdExists', () => {
    service.getIdExists('123').subscribe(result => {
      expect(result).toBe(true);
    });

    const req = httpMock.expectOne('http://localhost:3002/bp/products/verification/123');
    expect(req.request.method).toBe('GET');
    req.flush(true);
  });

  it('should call deleteProduct and show success modal', () => {
    mockModalService.open.mockReturnValue(of(true));

    service.deleteProduct('1').subscribe(response => {
      expect(response).toEqual({ data: null });
    });

    const req = httpMock.expectOne('http://localhost:3002/bp/products/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ data: null });
  });

  it('should show error modal on failed update', () => {
    const errorResponse = { status: 500, statusText: 'Server Error' };
    mockModalService.open.mockReturnValue(of(true));

    service.updateProduct('1', { name: 'New', description: '', logo: '', date_release: '', date_revision: '' })
      .subscribe({
        error: (err) => {
          expect(err.status).toBe(500);
        }
      });

    const req = httpMock.expectOne('http://localhost:3002/bp/products/1');
    expect(req.request.method).toBe('PUT');
    req.flush({ message: 'Error' }, errorResponse);
  });

  it('should create a product and show success modal', () => {
    const product: Product = {
      id: '1',
      name: 'Test',
      description: 'Desc',
      logo: '',
      date_release: '',
      date_revision: ''
    };
    const response: ApiResponse<Product> = { data: product };

    mockModalService.open.mockReturnValue(of(true));

    service.createProduct(product).subscribe(res => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(product);
    req.flush(response);
  });

  it('should read a product by id', () => {
    const product: Product = {
      id: '1',
      name: 'ReadTest',
      description: 'Desc',
      logo: '',
      date_release: '',
      date_revision: ''
    };

    service.readProduct('1').subscribe(res => {
      expect(res).toEqual(product);
    });

    const req = httpMock.expectOne('http://localhost:3002/bp/products/1');
    expect(req.request.method).toBe('GET');
    req.flush(product);
  });

});
