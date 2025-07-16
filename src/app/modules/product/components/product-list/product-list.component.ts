import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { catchError, delay, of, Subscription, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ModalService } from '../../../main/services/modal.service';

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit, OnDestroy {

  private _subscriptions: Subscription[];
  private _list: Product[];

  public list: Product[];
  public dropdownOpen: string;
  public pageSize: number;
  public textFilter: string;
  public currentPage: number;
  public isLoading: boolean;

  constructor(
    private readonly _productSvc: ProductService,
    private readonly _changeDetector: ChangeDetectorRef,
    private readonly _router: Router,
    private readonly _modalSvc: ModalService
  ) {
    this._subscriptions = [];
    this._list = [];
    this.currentPage = 1;
    this.list = [];
    this.dropdownOpen = '';
    this.pageSize = 5;
    this.textFilter = '';
    this.isLoading = false;
  }


  ngOnInit() {
    this.getProducts();
  }


  ngOnDestroy() {
    this._subscriptions.forEach(x => {
      x.unsubscribe();
    })
  }

  getProducts() {
    this.isLoading = true;
    let subs = this._productSvc.getProducts()
      .pipe(
        delay(1000),
        tap(x => {
          this._list = x;
          this.filterList();
          this.isLoading = false;
          this._changeDetector.detectChanges();
        }),
        catchError((err) => {
          return of([]);
        })
      ).subscribe();

    this._subscriptions.push(subs);
  }


  public toggleDropdown(id: string) {
    if (this.dropdownOpen == id) {
      this.dropdownOpen = '';
    } else {
      this.dropdownOpen = id;
    }
    this._changeDetector.detectChanges();
  }

  public filterList() {
    const term = this.textFilter.toLowerCase().trim();
    const filtered = this._list.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term)
    );

    this.list = filtered;
    this.list = this.list.slice(0);
    this._changeDetector.detectChanges();
    this.currentPage = 1;
  }

  public totalPages(): number {
    return Math.ceil(this.list.length / this.pageSize);
  }

  public paginatedList() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.list.slice(start, start + this.pageSize);
  }

  public onPageSizeChange() {
    this.currentPage = 1;
    this.filterList();
  }

  public nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
      this._changeDetector.detectChanges();
    }
  }

  public previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this._changeDetector.detectChanges();
    }
  }

  public addProduct() {
    this._router.navigate(['/products/new']);
  }

  public editProduct(id: string) {
    this._router.navigate(['/products/edit', id]);
  }

  public onDeleteProduct(product: Product) {
    this.toggleDropdown(product.id);
    let subs = this._modalSvc.open({
      title: '¿Estás seguro de que deseas eliminar el producto ' + product.name + '?',
      confirmTitle: 'Confirmar',
      cancelTitle: 'Cancelar',
      type: 'Info'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.deleteProduct(product.id);
      }
    });
    this._subscriptions.push(subs);
  }

  public deleteProduct(id: string) {
    let subs = this._productSvc.deleteProduct(id)
      .pipe(
        tap(x => {
          this._list = this._list.filter(x => x.id != id);
          this.currentPage = 1;
          this.filterList();
        }),
        catchError((err) => {
          return of(null);
        })
      ).subscribe();

    this._subscriptions.push(subs);
  }

}
