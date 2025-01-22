import React from 'react';
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route, Outlet } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { RoutePage } from './pages/RoutePage';
import { MeetupPage } from './pages/MeetupPage';
import { AboutPage } from './pages/AboutPage';
import { FAQPage } from './pages/FAQPage';

const Layout = () => (
  <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
    <Header />
    <Outlet />
  </div>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="route" element={<RoutePage />} />
      <Route path="meetup" element={<MeetupPage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="faq" element={<FAQPage />} />
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

export function App() {
  return <RouterProvider router={router} />;
}