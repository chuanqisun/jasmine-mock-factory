import { MockFactoryPage } from './app.po';

describe('mock-factory App', () => {
  let page: MockFactoryPage;

  beforeEach(() => {
    page = new MockFactoryPage();
  });

  it('should display welcome message', done => {
    page.navigateTo();
    page.getParagraphText()
      .then(msg => expect(msg).toEqual('Welcome to app!!'))
      .then(done, done.fail);
  });
});
