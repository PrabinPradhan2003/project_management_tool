import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const res = await axios.get('http://localhost:4000/api/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <h3>Projects</h3>
      {projects.length === 0 && <div>No projects (start backend and create some)</div>}
      <ul>
        {projects.map(p => (
          <li key={p.id}>{p.name} - tasks: {p.taskCount} - members: {p.memberCount}</li>
        ))}
      </ul>
    </div>
  );
}
