import { CaretDownIcon, CaretUpIcon, XIcon } from '@phosphor-icons/react';
import { useCallback, useId, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User } from 'shared';
import { Box, Button, Checkbox } from 'theme-ui';

export const AssigneeFilter = ({ users }: { users: User[] | undefined }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const assigneeIds = searchParams.getAll('assignee_id');
  const [open, setOpen] = useState(false);
  const listboxId = useId();

  const onCheckboxChange = useCallback(
    (userId: string, checked: boolean) => {
      setSearchParams((params) => {
        const current = params.getAll('assignee_id');
        params.delete('assignee_id');
        const updated = checked
          ? [...current, userId]
          : current.filter((id) => id !== userId);
        updated.forEach((id) => params.append('assignee_id', id));
        params.set('page', '1');
        return params;
      });
    },
    [setSearchParams],
  );

  const onClearFilters = useCallback(() => {
    setSearchParams((params) => {
      params.delete('assignee_id');
      params.set('page', '1');
      return params;
    });
  }, [setSearchParams]);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        gap: 'spacing-xs',
        alignItems: 'center',
      }}
    >
      {open && (
        <Box
          onClick={() => setOpen(false)}
          aria-hidden
          sx={{ position: 'fixed', inset: 0, zIndex: 'overlay' }}
        />
      )}
      <Button
        onClick={onClearFilters}
        disabled={assigneeIds.length === 0}
        variant="tertiary"
        aria-disabled={assigneeIds.length === 0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'spacing-2xs',
        }}
      >
        <XIcon weight="bold" />
        Clear Filters
      </Button>
      <Box sx={{ position: 'relative', flex: 1 }}>
        <Button
          value={'Filter by Assignee'}
          aria-expanded={open}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          onClick={() => setOpen((open) => !open)}
          onKeyDown={(key) => {
            if (key.key === 'Enter' || key.key === ' ') {
              setOpen((open) => !open);
            }
            if (key.key === 'Escape') {
              setOpen(false);
            }
          }}
          variant="secondary"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'spacing-2xs',
          }}
        >
          Filter by Assignee
          {open ? (
            <CaretUpIcon weight="bold" />
          ) : (
            <CaretDownIcon weight="bold" />
          )}
        </Button>
        {open && (
          <Box
            id={listboxId}
            role="listbox"
            as="ul"
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 'overlay',
              bg: 'white',
              borderWidth: 'border-width-sm',
              borderStyle: 'solid',
              borderColor: 'borderPanel',
              borderRadius: 'box-radius',
              p: 'spacing-xs',
              boxShadow: 'shadow-sm',
              mt: 'spacing-3xs',
            }}
          >
            {users?.map((user) => (
              <Box
                as="li"
                key={user.identifier}
                role="option"
                aria-selected={assigneeIds.includes(user.identifier)}
                sx={{ listStyle: 'none' }}
              >
                <Box
                  as="label"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'spacing-xs',
                    py: 'spacing-3xs',
                    px: 'spacing-2xs',
                    cursor: 'pointer',
                    color: 'textBase',
                    fontSize: 'font-size-md',
                    borderRadius: 'radius-sm',
                    '&:hover': { bg: 'bgPanel' },
                  }}
                >
                  <Checkbox
                    checked={assigneeIds.includes(user.identifier)}
                    onChange={(e) =>
                      onCheckboxChange(user.identifier, e.target.checked)
                    }
                  />
                  {user.name}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};
