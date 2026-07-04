import { HttpInterceptorFn, HttpRequest, HttpErrorResponse, HttpResponse, HttpHandlerFn } from '@angular/common/http';
import { tap } from 'rxjs';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export const HttpAPIInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const toastr = inject(ToastrService);

  return next(req).pipe(
    tap(
      (event: any) => {
        if (event instanceof HttpResponse && req.method !== 'GET') {
          toastr.success(event.body.msg);
        }
      },
      (error: any) => {
        if (error instanceof HttpErrorResponse) {
          let errorMessage = error.error.error;
          toastr.error(errorMessage, 'Error');
        }
      }
    ));
};