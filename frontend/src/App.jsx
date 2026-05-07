import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AgentsList from './pages/AgentsList';
import AgentForm from './pages/AgentForm';
import WorkflowsList from './pages/WorkflowsList';
import WorkflowBuilder from './pages/WorkflowBuilder';
import WorkflowRun from './pages/WorkflowRun';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login"    element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/"                      element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"             element={<Dashboard />} />
          <Route path="/agents"                element={<AgentsList />} />
          <Route path="/agents/new"            element={<AgentForm />} />
          <Route path="/agents/:id/edit"       element={<AgentForm />} />
          <Route path="/workflows"             element={<WorkflowsList />} />
          <Route path="/workflows/new"         element={<WorkflowBuilder />} />
          <Route path="/workflows/:id/run"     element={<WorkflowRun />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
