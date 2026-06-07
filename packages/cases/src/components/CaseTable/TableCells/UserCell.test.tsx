import { render, screen } from '@testing-library/react';
import { User } from 'shared';
import { UserCell } from './UserCell';

describe('UserCell', () => {
  it('should display the user name and activity status', () => {
    const user: User = { identifier: 'user-1', name: 'John Doe', active: true };
    render(<UserCell user={user} />);

    expect(screen.getByText('John Doe')).toBeVisible();
    expect(screen.getByText('Active')).toBeVisible();
  });

  it('should display the user identifier if name is not available', () => {
    const user: User = { identifier: 'user-1', name: '', active: true };
    render(<UserCell user={user} />);

    expect(screen.getByText('user-1')).toBeVisible();
  });

  it('should display "Active" if user is active', () => {
    const user: User = { identifier: 'user-2', name: 'Jane', active: true };
    render(<UserCell user={user} />);

    expect(screen.getByText('Active')).toBeVisible();
  });

  it('should display "Inactive" if user is not active', () => {
    const user: User = { identifier: 'user-2', name: 'Jane', active: false };
    render(<UserCell user={user} />);

    expect(screen.getByText('Inactive')).toBeVisible();
  });
});
