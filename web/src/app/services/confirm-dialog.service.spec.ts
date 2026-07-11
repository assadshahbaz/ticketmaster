import { expect } from 'chai';
import { ConfirmDialogService } from './confirm-dialog.service';

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;

  beforeEach(() => {
    service = new ConfirmDialogService();
  });

  it('starts hidden with the default copy', () => {
    const state = service.state();
    expect(state.visible).to.be.false;
    expect(state.title).to.equal('Are you sure?');
    expect(state.confirmButtonText).to.equal('Yes, delete it!');
  });

  it('confirm() shows the dialog, merging any given options over the defaults', () => {
    service.confirm({ title: 'Delete ticket?' });

    const state = service.state();
    expect(state.visible).to.be.true;
    expect(state.title).to.equal('Delete ticket?');
    expect(state.text).to.equal("You won't be able to revert this!");
  });

  it('respond(true) hides the dialog and resolves the confirm() promise with true', async () => {
    const pending = service.confirm();
    service.respond(true);

    expect(await pending).to.be.true;
    expect(service.state().visible).to.be.false;
  });

  it('respond(false) resolves the confirm() promise with false', async () => {
    const pending = service.confirm();
    service.respond(false);

    expect(await pending).to.be.false;
  });
});
