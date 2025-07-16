import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, delay, of, Subscription, tap } from 'rxjs';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { minDateValidator } from '../../validators/min-date.validator';

@Component({
  selector: 'app-product-form',
  standalone: false,
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit, OnDestroy {

  private _subscriptions: Subscription[];

  public product: Product | null;
  public id: string | null;
  public form: FormGroup;
  public showErrors: boolean;
  public minDate: string;
  public isLoading: boolean;

  constructor(
    private readonly _productSvc: ProductService,
    private readonly _route: ActivatedRoute,
    private readonly _fb: FormBuilder,
    private readonly _router: Router,
    private readonly _changeDetector: ChangeDetectorRef,
  ) {
    this._subscriptions = [];
    this.product = null;
    this.id = null;
    this.showErrors = false;
    this.form = new FormGroup({});
    this.minDate = '';
    this.isLoading = false;
  }


  ngOnInit() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.minDate = `${yyyy}-${mm}-${dd}`;
    this.id = this._route.snapshot.paramMap.get('id');
    this._createForm();
    if (this.id) {
      this._getProduct(this.id);
    }
  }


  ngOnDestroy(): void {
    this._subscriptions?.forEach(element => {
      element.unsubscribe();
    });
  }

  private _createForm() {
    this.form.addControl('id', this._fb.control(null, [Validators.required, Validators.minLength(3), Validators.maxLength(10)]));
    this.form.addControl('name', this._fb.control(null, [Validators.required, Validators.minLength(5), Validators.maxLength(100)]));
    this.form.addControl('description', this._fb.control(null, [Validators.required, Validators.minLength(10), Validators.maxLength(200)]));
    this.form.addControl('logo', this._fb.control(null, Validators.required));
    this.form.addControl('date_release', this._fb.control(null, [Validators.required, minDateValidator]));
    this.form.addControl('date_revision', this._fb.control(null, Validators.required));
  }

  private _setForm() {
    this.form.get('id')?.setValue(this.product?.id);
    this.form.get('name')?.setValue(this.product?.name);
    this.form.get('description')?.setValue(this.product?.description);
    this.form.get('logo')?.setValue(this.product?.logo);
    this.form.get('date_release')?.setValue(this.product?.date_release);
    this.form.get('date_revision')?.setValue(this.product?.date_revision);
    this.form.get('date_revision')?.disable();
    if (this.id) {
      this.form.get('id')?.disable();
    }
  }


  private _getProduct(id: string) {
    this.isLoading = true;
    let subs = this._productSvc.readProduct(id)
      .pipe(
        delay(1000),
        tap(x => {
          this.product = x;
          this._setForm();
          this.isLoading = false;
          this._changeDetector.detectChanges();
        }),
        catchError((err) => {
          return of(null);
        })
      ).subscribe();

    this._subscriptions.push(subs);
  }

  public getErrors(control: string): boolean {
    const ctrl = this.form.get(control);
    return (ctrl && ctrl.errors?.['required'] && this.showErrors);
  }

  public getPatternError(control: string) {
    const ctrl = this.form.get(control);
    return (ctrl && (ctrl.errors?.['minlength'] || ctrl.errors?.['maxlength']) && this.showErrors);
  }


  public getMinDateError(control: string) {
    const ctrl = this.form.get(control);
    return (ctrl && ctrl.errors?.['minDate'] && this.showErrors);
  }

  public setRevisionDate() {
    const release = this.form.get('date_release')?.value;
    if (release) {
      const releaseDate = new Date(release);
      const revisionDate = new Date(releaseDate);
      revisionDate.setFullYear(releaseDate.getFullYear() + 1);

      this.form.get('date_revision')?.setValue(revisionDate.toISOString().substring(0, 10));
    }
  }


  public saveProduct() {
    if (this.form.valid) {
      let request: Product;
      request = {
        id: this.form.get('id')?.value,
        name: this.form.get('name')?.value,
        description: this.form.get('description')?.value,
        logo: this.form.get('logo')?.value,
        date_release: this.form.get('date_release')?.value,
        date_revision: this.form.get('date_revision')?.value
      }
      if (this.id) {
        this.updateProduct(request, this.id);
      } else {
        this.addProduct(request);
      }
    } else {
      this.showErrors = true;
    }
  }

  public resetForm() {
    if (this.id) {
      this._setForm();
    } else {
      this.form.reset();
    }
  }

  public addProduct(request: Product) {
    let subs = this._productSvc.createProduct(request).pipe(
      tap(x => {
        this._router.navigate(['/products']);
      }),
      catchError((err) => {
        return of(null);
      })
    ).subscribe();
    this._subscriptions.push(subs);
  }

  public updateProduct(request: Product, id: string) {
    let subs = this._productSvc.updateProduct(id, request).pipe(
      tap(x => {
        this._router.navigate(['/products']);
      }),
      catchError((err) => {
        return of(null);
      })
    ).subscribe();
    this._subscriptions.push(subs);
  }

}
