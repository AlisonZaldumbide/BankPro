import { ProductListComponent } from './product-list.component';
import { of } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let mockProductService: any;
  let mockChangeDetector: any;
  let mockRouter: any;
  let mockModalService: any;

  beforeEach(() => {
    mockProductService = {
      getProducts: jest.fn(),
      deleteProduct: jest.fn()
    };

    mockChangeDetector = {
      detectChanges: jest.fn()
    };

    mockRouter = {
      navigate: jest.fn()
    };

    mockModalService = {
      open: jest.fn()
    };

    component = new ProductListComponent(
      mockProductService,
      mockChangeDetector,
      mockRouter,
      mockModalService
    );
  });

  it('should initialize with default values', () => {
    expect(component.list).toEqual([]);
    expect(component.pageSize).toBe(5);
    expect(component.textFilter).toBe('');
    expect(component.currentPage).toBe(1);
  });

  it('should load and filter products on getProducts()', fakeAsync(() => {
    const fakeProducts = [
      { id: '1', name: 'A', description: 'desc', logo: '', date_release: '', date_revision: '' },
      { id: '2', name: 'B', description: 'desc', logo: '', date_release: '', date_revision: '' }
    ];
    mockProductService.getProducts.mockReturnValue(of(fakeProducts).pipe());

    component.getProducts();
    tick(1000);

    expect(mockProductService.getProducts).toHaveBeenCalled();
    expect(component.list.length).toBe(2);
    expect(mockChangeDetector.detectChanges).toHaveBeenCalled();
  }));

  it('should navigate to new product form', () => {
    component.addProduct();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products/new']);
  });

  it('should toggle dropdown state', () => {
    component.toggleDropdown('123');
    expect(component.dropdownOpen).toBe('123');

    component.toggleDropdown('123');
    expect(component.dropdownOpen).toBe('');
  });

  it('should navigate to edit page with product id', () => {
    component.editProduct('456');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products/edit', '456']);
  });

  it('should call deleteProduct when modal confirms', () => {
    const product = { id: '99', name: 'Test', description: '', logo: '', date_release: '', date_revision: '' };
    mockModalService.open.mockReturnValue(of(true));
    mockProductService.deleteProduct.mockReturnValue(of(null));

    (component as any)._list = [product];
    component.onDeleteProduct(product);

    expect(mockProductService.deleteProduct).toHaveBeenCalledWith('99');
  });

  it('should filter list by name or description', () => {
    (component as any)._list = [
      { id: 'P001', name: 'Tarjeta', description: 'One', logo: '', date_release: '', date_revision: '' },
      { id: 'P002', name: 'Credito', description: 'Nothing', logo: '', date_release: '', date_revision: '' }
    ];
    component.textFilter = 'Tarjeta';
    component.filterList();

    expect(component.list.length).toBe(1);
    expect(component.list[0].name).toBe('Tarjeta');
  });
});
