import { expect } from 'chai';
import sinon from 'sinon';
import { TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let dialogService: ConfirmDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ConfirmDialogComponent] });
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    dialogService = component.dialogService;
  });

  it('confirm() responds with true', () => {
    const respondSpy = sinon.spy(dialogService, 'respond');

    component.confirm();

    expect(respondSpy).to.have.been.calledOnceWith(true);
  });

  it('cancel() responds with false', () => {
    const respondSpy = sinon.spy(dialogService, 'respond');

    component.cancel();

    expect(respondSpy).to.have.been.calledOnceWith(false);
  });
});
