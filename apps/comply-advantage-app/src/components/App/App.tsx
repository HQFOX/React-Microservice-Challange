import { Box } from 'theme-ui';
import { Outlet } from 'react-router-dom';
import { Nav } from '../Nav/Nav';

function App() {
  return (
    <>
      <Nav />
      <Box sx={{ p: 'spacing-md' }}>
        <Outlet />
      </Box>
    </>
  );
}

export default App;
