import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { User } from 'shared';
import { AssigneeFilter } from './AssigneeFilter';

const mockUsers: User[] = [
  { identifier: 'u1', name: 'Alice', active: true },
  { identifier: 'u2', name: 'Bob', active: false },
];

const renderComponent = (users: User[] | undefined, initialSearch = '') =>
  render(
    <MemoryRouter initialEntries={[`/${initialSearch}`]}>
      <AssigneeFilter users={users} />
    </MemoryRouter>,
  );

describe('AssigneeFilter', () => {
  describe('rendering', () => {
    it('renders "Filter by Assignee" and "Clear Filters" buttons', () => {
      renderComponent(mockUsers);

      expect(
        screen.getByRole('button', { name: /filter by assignee/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /clear filters/i }),
      ).toBeInTheDocument();
    });

    it('"Clear Filters" is disabled when no assignee_id in URL', () => {
      renderComponent(mockUsers);

      expect(
        screen.getByRole('button', { name: /clear filters/i }),
      ).toBeDisabled();
    });

    it('"Clear Filters" is enabled when assignee_id param is present', () => {
      renderComponent(mockUsers, '?assignee_id=u1');

      expect(
        screen.getByRole('button', { name: /clear filters/i }),
      ).not.toBeDisabled();
    });

    it('dropdown is hidden by default', () => {
      renderComponent(mockUsers);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('renders no user items when users is undefined', () => {
      renderComponent(undefined);

      fireEvent.click(
        screen.getByRole('button', { name: /filter by assignee/i }),
      );

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.queryAllByRole('option')).toHaveLength(0);
    });
  });

  describe('dropdown toggle', () => {
    it('clicking "Filter by Assignee" opens the dropdown', () => {
      renderComponent(mockUsers);

      fireEvent.click(
        screen.getByRole('button', { name: /filter by assignee/i }),
      );

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('clicking "Filter by Assignee" a second time closes the dropdown', () => {
      renderComponent(mockUsers);
      const toggleButton = screen.getByRole('button', {
        name: /filter by assignee/i,
      });

      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('dropdown lists all user names when open', () => {
      renderComponent(mockUsers);

      fireEvent.click(
        screen.getByRole('button', { name: /filter by assignee/i }),
      );

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('pressing Escape on the toggle button closes the dropdown', () => {
      renderComponent(mockUsers);
      const toggleButton = screen.getByRole('button', {
        name: /filter by assignee/i,
      });

      fireEvent.click(toggleButton);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      fireEvent.keyDown(toggleButton, { key: 'Escape' });
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('checkbox interactions', () => {
    it('checkbox for a user whose id is in URL params is pre-checked', () => {
      renderComponent(mockUsers, '?assignee_id=u1');

      fireEvent.click(
        screen.getByRole('button', { name: /filter by assignee/i }),
      );

      const aliceCheckbox = screen.getByRole('checkbox', { name: /alice/i });
      const bobCheckbox = screen.getByRole('checkbox', { name: /bob/i });
      expect(aliceCheckbox).toBeChecked();
      expect(bobCheckbox).not.toBeChecked();
    });

    it('clicking an unchecked checkbox checks it', () => {
      renderComponent(mockUsers);

      fireEvent.click(
        screen.getByRole('button', { name: /filter by assignee/i }),
      );
      const aliceCheckbox = screen.getByRole('checkbox', { name: /alice/i });
      expect(aliceCheckbox).not.toBeChecked();

      fireEvent.click(aliceCheckbox);
      expect(aliceCheckbox).toBeChecked();
    });

    it('clicking a checked checkbox unchecks it', () => {
      renderComponent(mockUsers, '?assignee_id=u1');

      fireEvent.click(
        screen.getByRole('button', { name: /filter by assignee/i }),
      );
      const aliceCheckbox = screen.getByRole('checkbox', { name: /alice/i });
      expect(aliceCheckbox).toBeChecked();

      fireEvent.click(aliceCheckbox);
      expect(aliceCheckbox).not.toBeChecked();
    });

    it('clicking "Clear Filters" unchecks all checkboxes', () => {
      renderComponent(mockUsers, '?assignee_id=u1&assignee_id=u2');

      fireEvent.click(
        screen.getByRole('button', { name: /filter by assignee/i }),
      );
      expect(screen.getByRole('checkbox', { name: /alice/i })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /bob/i })).toBeChecked();

      fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));

      expect(
        screen.getByRole('checkbox', { name: /alice/i }),
      ).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /bob/i })).not.toBeChecked();
    });
  });
});
