import { cases } from './cases';
import { vi } from 'vitest';
import { casesHandler, caseHandler } from './handlers';
import { HttpResponse } from 'msw';

vi.mock('msw');
vi.mock('./cases', () => ({
  cases: new Array(50).fill(undefined).map((_, index) => ({
    identifier: String(index + 1),
    assignee_id: 'user-1',
    status: 'CASE_ON_HOLD',
    name: `Case ${index + 1}`,
  })),
}));

describe('cases handler', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('when there are 50 cases', () => {
    describe('when page is 1 and size is 20', () => {
      it('returns cases 1-20', () => {
        const url = new URL(
          '/api/cases?page_number=1&page_size=20',
          'http://api.org/',
        );
        const request = new Request(url);

        casesHandler({ request });

        expect(HttpResponse.json).toHaveBeenCalledTimes(1);
        expect(HttpResponse.json).toHaveBeenCalledWith({
          cases: cases.slice(0, 20),
          first: '/api/cases?page_number=1',
          next: '/api/cases?page_number=2',
          prev: '',
          self: '/api/cases?page_number=1',
          total_count: 50,
        });
      });
    });

    describe('when page is 2 and size is 20', () => {
      it('returns cases 21-40', () => {
        const url = new URL(
          '/api/cases?page_number=2&page_size=20',
          'http://api.org/',
        );
        const request = new Request(url);

        casesHandler({ request });

        expect(HttpResponse.json).toHaveBeenCalledTimes(1);
        expect(HttpResponse.json).toHaveBeenCalledWith({
          cases: cases.slice(20, 40),
          first: '/api/cases?page_number=1',
          next: '/api/cases?page_number=3',
          prev: '/api/cases?page_number=1',
          self: '/api/cases?page_number=2',
          total_count: 50,
        });
      });
    });

    describe('when page is 3 and size is 20', () => {
      it('returns cases 41-50', () => {
        const url = new URL(
          '/api/cases?page_number=3&page_size=20',
          'http://api.org/',
        );
        const request = new Request(url);

        casesHandler({ request });

        expect(HttpResponse.json).toHaveBeenCalledTimes(1);
        expect(HttpResponse.json).toHaveBeenCalledWith({
          cases: cases.slice(40, 50),
          first: '/api/cases?page_number=1',
          next: '',
          prev: '/api/cases?page_number=2',
          self: '/api/cases?page_number=3',
          total_count: 50,
        });
      });
    });

    describe('when page is 5 and size is 10', () => {
      it('returns cases 41-50', () => {
        const url = new URL(
          '/api/cases?page_number=5&page_size=10',
          'http://api.org/',
        );
        const request = new Request(url);

        casesHandler({ request });

        expect(HttpResponse.json).toHaveBeenCalledTimes(1);
        expect(HttpResponse.json).toHaveBeenCalledWith({
          cases: cases.slice(40, 50),
          first: '/api/cases?page_number=1',
          next: '',
          prev: '/api/cases?page_number=4',
          self: '/api/cases?page_number=5',
          total_count: 50,
        });
      });
    });

    describe('when page is 1 and size is 50', () => {
      it('returns cases 1-50', () => {
        const url = new URL(
          '/api/cases?page_number=1&page_size=50',
          'http://api.org/',
        );
        const request = new Request(url);

        casesHandler({ request });

        expect(HttpResponse.json).toHaveBeenCalledTimes(1);
        expect(HttpResponse.json).toHaveBeenCalledWith({
          cases: cases.slice(0, 50),
          first: '/api/cases?page_number=1',
          next: '',
          prev: '',
          self: '/api/cases?page_number=1',
          total_count: 50,
        });
      });
    });

    describe('when page is 1 and size is 51', () => {
      it('returns cases 1-50', () => {
        const url = new URL(
          '/api/cases?page_number=1&page_size=51',
          'http://api.org/',
        );
        const request = new Request(url);

        casesHandler({ request });

        expect(HttpResponse.json).toHaveBeenCalledTimes(1);
        expect(HttpResponse.json).toHaveBeenCalledWith({
          cases: cases.slice(0, 50),
          first: '/api/cases?page_number=1',
          next: '',
          prev: '',
          self: '/api/cases?page_number=1',
          total_count: 50,
        });
      });
    });

    describe('when page number is beyond end of data', () => {
      it('returns no cases', () => {
        const url = new URL(
          '/api/cases?page_number=100&page_size=20',
          'http://api.org/',
        );
        const request = new Request(url);

        casesHandler({ request });

        expect(HttpResponse.json).toHaveBeenCalledTimes(1);
        expect(HttpResponse.json).toHaveBeenCalledWith({
          cases: [],
          first: '',
          next: '',
          prev: '',
          self: '',
          total_count: 0,
        });
      });
    });

    describe('when page_number is negative', () => {
      it('clamps to page 1', () => {
        const url = new URL(
          '/api/cases?page_number=-5&page_size=20',
          'http://api.org/',
        );
        const request = new Request(url);

        casesHandler({ request });

        expect(HttpResponse.json).toHaveBeenCalledTimes(1);
        expect(HttpResponse.json).toHaveBeenCalledWith({
          cases: cases.slice(0, 20),
          first: '/api/cases?page_number=1',
          next: '/api/cases?page_number=2',
          prev: '',
          self: '/api/cases?page_number=1',
          total_count: 50,
        });
      });
    });

    describe('when page_size is negative', () => {
      it('clamps to page_size 1', () => {
        const url = new URL(
          '/api/cases?page_number=1&page_size=-5',
          'http://api.org/',
        );
        const request = new Request(url);

        casesHandler({ request });

        expect(HttpResponse.json).toHaveBeenCalledTimes(1);
        expect(HttpResponse.json).toHaveBeenCalledWith({
          cases: cases.slice(0, 1),
          first: '/api/cases?page_number=1',
          next: '/api/cases?page_number=2',
          prev: '',
          self: '/api/cases?page_number=1',
          total_count: 50,
        });
      });
    });

    describe('when params not provided', () => {
      it('defaults to page 1, size 10', () => {
        const url = new URL('/cases', 'http://api.org/');
        const request = new Request(url);

        casesHandler({ request });

        expect(HttpResponse.json).toHaveBeenCalledTimes(1);
        expect(HttpResponse.json).toHaveBeenCalledWith({
          cases: cases.slice(0, 10),
          first: '/api/cases?page_number=1',
          next: '/api/cases?page_number=2',
          prev: '',
          self: '/api/cases?page_number=1',
          total_count: 50,
        });
      });
    });
  });
});

describe('caseHandler', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('when the case exists', () => {
    it('returns the matching case', () => {
      caseHandler({ params: { id: '1' } });

      expect(HttpResponse.json).toHaveBeenCalledTimes(1);
      expect(HttpResponse.json).toHaveBeenCalledWith(cases[0]);
    });
  });

  describe('when the case does not exist', () => {
    it('returns a 404 response', () => {
      caseHandler({ params: { id: 'non-existent-id' } });

      expect(HttpResponse.json).toHaveBeenCalledTimes(1);
      expect(HttpResponse.json).toHaveBeenCalledWith(
        { message: 'Not found' },
        { status: 404 },
      );
    });
  });
});
