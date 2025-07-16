import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductFormComponent } from './product-form.component';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

const mockProductService = {
  readProduct: jest.fn().mockReturnValue(of({
    id: 'P001',
    name: 'Producto de prueba',
    description: 'Descripción de prueba',
    logo: 'https://example.com/logo.png',
    date_release: '2024-07-15',
    date_revision: '2025-07-15'
  })),
  createProduct: jest.fn().mockReturnValue(of({})),
  updateProduct: jest.fn().mockReturnValue(of({}))
};

const mockActivatedRoute = {
  snapshot: {
    paramMap: {
      get: jest.fn().mockReturnValue('P001')
    }
  }
};

const mockRouter = {
  navigate: jest.fn()
};

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ProductFormComponent],
      providers: [
        FormBuilder,
        { provide: ProductService, useValue: mockProductService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with product data if id is present', () => {
    expect(component.form.get('id')?.value).toBe('P001');
    expect(component.form.get('name')?.value).toBe('Producto de prueba');
  });

  it('should call createProduct when saving a new product', () => {
    component.id = null;
    component.form.setValue({
      id: 'P002',
      name: 'Nuevo producto',
      description: 'Descripción larga de prueba',
      logo: 'https://example.com/logo2.png',
      date_release: '2024-07-16',
      date_revision: '2025-07-16'
    });

    component.saveProduct();

    expect(mockProductService.createProduct).toHaveBeenCalledWith(expect.objectContaining({
      id: 'P002'
    }));
  });

  it('should call updateProduct when editing existing product', () => {
    component.id = 'P001';
    component.form.enable();
    component.form.patchValue({
      name: 'Producto actualizado'
    });
    component.saveProduct();

    expect(mockProductService.updateProduct).toHaveBeenCalledWith('P001', expect.anything());
  });

  it('should set date_revision one year after date_release', () => {
    component.form.get('date_release')?.setValue('2024-07-15');
    component.setRevisionDate();
    expect(component.form.get('date_revision')?.value).toBe('2025-07-15');
  });
});
