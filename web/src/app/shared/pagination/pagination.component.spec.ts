import { expect } from 'chai';
import sinon from 'sinon';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let component: PaginationComponent;

  beforeEach(() => {
    component = new PaginationComponent();
  });

  it('builds a 1-based array of page numbers up to totalPages', () => {
    component.totalPages = 4;
    expect(component.totalPagesArray).to.deep.equal([1, 2, 3, 4]);
  });

  it('emits pageChange when navigating to a page within range', () => {
    component.totalPages = 5;
    const emitSpy = sinon.spy(component.pageChange, 'emit');

    component.goToPage(3);

    expect(emitSpy).to.have.been.calledOnceWith(3);
  });

  it('does not emit when navigating out of range', () => {
    component.totalPages = 5;
    const emitSpy = sinon.spy(component.pageChange, 'emit');

    component.goToPage(0);
    component.goToPage(6);

    expect(emitSpy).to.not.have.been.called;
  });
});
