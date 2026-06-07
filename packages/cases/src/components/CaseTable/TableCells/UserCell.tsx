import { Card, Text } from 'theme-ui';
import { User } from 'shared';

export const UserCell = ({ user }: { user: User | undefined }) => {
  if (!user) return null;

  return (
    <Card
      variant="outlined"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'spacing-xs',
        px: 'spacing-xs',
        py: 'spacing-3xs',
      }}
    >
      <Text variant="default" sx={{ fontWeight: 'font-weight-semi-bold' }}>
        {user.name || user.identifier}
      </Text>
      <Text
        variant="default"
        sx={{ color: user.active ? 'textPositive' : 'textMuted' }}
      >
        {user.active ? 'Active' : 'Inactive'}
      </Text>
    </Card>
  );
};
