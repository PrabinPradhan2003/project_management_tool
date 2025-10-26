# ER Diagram (simplified ASCII)

User (id, name, email, password, role)
  |\
  | \--< ProjectUsers >--/ Project (id, name, description, status)
  |
  +--< Task (id, title, description, status, deadline, projectId, assigneeId)

Notes: ProjectUsers is a join table linking users and projects (team membership).
