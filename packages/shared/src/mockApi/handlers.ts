import { http, HttpResponse, StrictRequest, DefaultBodyType } from 'msw';
import example from './example.json';
import { users } from './users';
import { cases } from './cases';

import { GetCasesResponse, GetUsersResponse } from './types';

const DEFAULT_PAGE_SIZE = 10;

export const casesHandler = ({
  request,
}: {
  request: StrictRequest<DefaultBodyType>;
}) => {
  const url = new URL(request.url);

  const page_size = url.searchParams.get('page_size');
  const page_number = url.searchParams.get('page_number');
  const assignee_ids = url.searchParams.getAll('assignee_id');

  const page = Math.max(1, Number.parseInt(page_number as string, 10) || 1);
  const size = Math.max(
    1,
    Number.parseInt(page_size as string, 10) || DEFAULT_PAGE_SIZE,
  );

  const filteredCases =
    assignee_ids.length > 0
      ? cases.filter((c) => assignee_ids.includes(c.assignee_id))
      : cases;

  const start = (page - 1) * size;

  if (start > filteredCases.length - 1) {
    return HttpResponse.json({
      cases: [],
      total_count: 0,
      first: '',
      next: '',
      prev: '',
      self: '',
    });
  }

  const end = start + size;

  const casesArray = filteredCases.slice(start, end);

  const hasNext = end < filteredCases.length;

  return HttpResponse.json({
    cases: casesArray,
    total_count: filteredCases.length,
    first: '/api/cases?page_number=1',
    next: hasNext ? `/api/cases?page_number=${page + 1}` : '',
    prev: page > 1 ? `/api/cases?page_number=${page - 1}` : '',
    self: `/api/cases?page_number=${page}`,
  } as GetCasesResponse);
};

export const caseHandler = ({ params }: { params: { id: string } }) => {
  const found = cases.find((c) => c.identifier === params.id);
  if (!found)
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  return HttpResponse.json(found);
};

export const apiHandlers = [
  http.get('/api/example', () => {
    return HttpResponse.json(example);
  }),

  http.get('/api/users', () => {
    return HttpResponse.json(users as GetUsersResponse);
  }),

  http.get('/api/cases/:id', caseHandler),

  http.get('/api/cases', casesHandler),
];
