import { BrowserRouter } from 'react-router-dom';
import HostDispatcher from './components/routing/HostDispatcher';

function App() {
  return (
    <BrowserRouter>
      <HostDispatcher />
    </BrowserRouter>
  );
}

export default App;
