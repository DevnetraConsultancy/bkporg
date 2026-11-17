import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import './index.css';
import { StoreProvider, useStore } from './data/store';
import Login from './pages/Login';
import Hierarchy from './pages/Hierarchy';
import Person from './pages/Person';
import EditPerson from './pages/EditPerson';
import Ranking from './pages/Ranking';
import { EventsList, NewEvent } from './pages/Events';
import { Chat, Inbox } from './pages/Messages';
import Search from './pages/Search';
import Me from './pages/Me';
import Leaders from './pages/Leaders';
import { ChangePassword, MyProfile } from './pages/MyAccount';

function App() {
  const { user } = useStore();
  if (!user) return <Login />;
  return (
    <Routes>
      <Route path="/" element={<Hierarchy />} />
      <Route path="/unit/:id" element={<Hierarchy />} />
      <Route path="/unit/:unitId/add" element={<EditPerson />} />
      <Route path="/unit/:unitId/ranking" element={<Ranking />} />
      <Route path="/person/:id" element={<Person />} />
      <Route path="/person/:id/edit" element={<EditPerson />} />
      <Route path="/events" element={<EventsList />} />
      <Route path="/events/new" element={<NewEvent />} />
      <Route path="/messages" element={<Inbox />} />
      <Route path="/messages/:id" element={<Chat />} />
      <Route path="/search" element={<Search />} />
      <Route path="/me" element={<Me />} />
      <Route path="/me/profile" element={<MyProfile />} />
      <Route path="/me/password" element={<ChangePassword />} />
      <Route path="/admin/leaders" element={<Leaders />} />
      <Route path="/admin/leaders/:unitId" element={<Leaders />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider><HashRouter><App /></HashRouter></StoreProvider>
  </StrictMode>,
);
