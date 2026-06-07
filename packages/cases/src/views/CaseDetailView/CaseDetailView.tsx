import { Container, Heading, Text, Box, Spinner } from 'theme-ui';

import { useParams } from 'react-router-dom';
import { CasesApi, UserApi, User } from 'shared';

import { StatusCell, UserCell } from '../../components/CaseTable/TableCells';

export const CaseDetailView = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: caseData,
    isLoading: caseLoading,
    isError: caseError,
  } = CasesApi.useGetCaseQuery(id);
  const { data: users } = UserApi.useGetUsersQuery();

  const assignee = users?.find(
    (u: User) => u.identifier === caseData?.assignee_id,
  );

  if (caseLoading) {
    return (
      <Container>
        <Spinner />
      </Container>
    );
  }

  if (caseError || !caseData) {
    return (
      <Container>
        <Text>Error loading case.</Text>
      </Container>
    );
  }

  return (
    <Container>
      <Heading as="h2">{caseData.name}</Heading>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'spacing-s',
          mt: 'spacing-m',
        }}
      >
        <Box>
          <Text
            variant="default"
            sx={{ fontWeight: 'font-weight-semi-bold', mr: 'spacing-xs' }}
          >
            Status
          </Text>
          <StatusCell status={caseData.status} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 'spacing-xs' }}>
          <Text variant="default" sx={{ fontWeight: 'font-weight-semi-bold' }}>
            Assignee
          </Text>
          <UserCell user={assignee} />
        </Box>
      </Box>
    </Container>
  );
};
