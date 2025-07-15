import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, of, Subscription, tap } from 'rxjs';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  constructor(
    private readonly _productSvc: ProductService,
    private readonly _route: ActivatedRoute,
    private readonly _fb: FormBuilder,
    private readonly _router: Router
  ) {
    this._subscriptions = [];
    this.product = null;
    this.id = null;
    this.showErrors = false;
    this.form = new FormGroup({});
  }


  ngOnInit() {
    this.id = this._route.snapshot.paramMap.get('id');
    this._createForm();
    if (this.id) {
      this._setForm();
    }
  }


  ngOnDestroy(): void {
    this._subscriptions?.forEach(element => {
      element.unsubscribe();
    });
  }

  private _createForm() {
    this.form.addControl('id', this._fb.control(null, Validators.required));
    this.form.addControl('name', this._fb.control(null, Validators.required));
    this.form.addControl('description', this._fb.control(null, Validators.required));
    this.form.addControl('logo', this._fb.control(null, Validators.required));
    this.form.addControl('date_release', this._fb.control(null, Validators.required));
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


  public getProduct() {
    // let subs = this._productSvc.()
    //   .pipe(
    //     tap(x => {
    //       this.product = x;
    //     }),
    //     catchError((err) => {
    //       return of([]);
    //     })
    //   ).subscribe();

    // this._subscriptions.push(subs);
  }

  public getErrors(control: string) {
    return (this.form.get(control)?.invalid && this.showErrors);
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
    this.form.reset();
    this.showErrors = false;
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
