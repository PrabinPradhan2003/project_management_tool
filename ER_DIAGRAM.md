# Database ER Diagram

## Entity Relationship Diagram for Project Management Tool

```
┌─────────────────────────────┐
│         USER                │
├─────────────────────────────┤
│ _id: ObjectId (PK)          │
│ name: String                │
│ email: String (UNIQUE)      │
│ password: String (HASHED)   │
│ role: Enum                  │
│   - Admin                   │
│   - Manager                 │
│   - Developer               │
│ createdAt: Date             │
│ updatedAt: Date             │
└─────────────────────────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────────────────┐
│       PROJECT               │
├─────────────────────────────┤
│ _id: ObjectId (PK)          │
│ name: String                │
│ description: String         │
│ status: Enum                │
│   - Planning                │
│   - In Progress             │
│   - Completed               │
│ startDate: Date             │
│ endDate: Date               │
│ members: Array [            │
│   {                         │
│     user: ObjectId (FK)     │──┐
│     role: Enum              │  │
│       - Manager             │  │
│       - Developer           │  │
│   }                         │  │
│ ]                           │  │
│ createdAt: Date             │  │
│ updatedAt: Date             │  │
└─────────────────────────────┘  │
         │                       │
         │ 1:N                   │
         │                       │
         ▼                       │
┌─────────────────────────────┐  │
│         TASK                │  │
├─────────────────────────────┤  │
│ _id: ObjectId (PK)          │  │
│ title: String               │  │
│ description: String         │  │
│ status: Enum                │  │
│   - To Do                   │  │
│   - In Progress             │  │
│   - Done                    │  │
│ deadline: Date              │  │
│ project: ObjectId (FK)      │──┤
│ assignee: ObjectId (FK)     │──┤
│ createdAt: Date             │  │
│ updatedAt: Date             │  │
└─────────────────────────────┘  │
         ▲                       │
         │                       │
         │ 1:1 (Optional)        │
         │                       │
┌─────────────────────────────┐  │
│      USER STORY (AI)        │  │
├─────────────────────────────┤  │
│ _id: ObjectId (PK)          │  │
│ projectId: ObjectId (FK)    │──┘
│ story: String               │
│ role: String                │
│ action: String              │
│ benefit: String             │
│ status: Enum                │
│   - pending                 │
│   - converted_to_task       │
│   - rejected                │
│ taskId: ObjectId (FK)       │──┘
│ createdAt: Date             │
└─────────────────────────────┘
```

## Relationships Explained

### 1. USER → PROJECT (Many-to-Many via Subdocuments)
- A User can be a member of multiple Projects
- A Project can have multiple Users as members
- **Implementation:** Projects store members as an array of subdocuments containing user reference and role

### 2. PROJECT → TASK (One-to-Many)
- A Project can have multiple Tasks
- A Task belongs to one Project
- **Cascade:** When a Project is deleted, all associated Tasks should be deleted (implement in code)

### 3. USER → TASK (One-to-Many)
- A User can be assigned to multiple Tasks
- A Task can have one assignee (or none)
- **Optional:** Assignee can be null for unassigned tasks

### 4. PROJECT → USER STORY (One-to-Many)
- A Project can have multiple AI-generated User Stories
- A User Story belongs to one Project
- **AI Feature:** Stories are generated from project descriptions

### 5. USER STORY → TASK (One-to-One Optional)
- A User Story can be converted into one Task
- A Task may be created from a User Story (optional)
- **Workflow:** Pending stories can be converted to tasks

## Indexes for Performance

```javascript
// Users
users.createIndex({ email: 1 }, { unique: true })

// Projects
projects.createIndex({ status: 1 })
projects.createIndex({ 'members.user': 1 })

// Tasks
tasks.createIndex({ project: 1 })
tasks.createIndex({ assignee: 1 })
tasks.createIndex({ status: 1 })
tasks.createIndex({ deadline: 1 })

// UserStories
userStories.createIndex({ projectId: 1 })
userStories.createIndex({ status: 1 })
userStories.createIndex({ taskId: 1 })
```

## Data Validation Rules

### User
- Email must be unique and valid format
- Password must be hashed (bcrypt)
- Role must be one of: Admin, Manager, Developer

### Project
- Name is required (min 3 characters)
- Status must be valid enum value
- startDate must be before endDate
- Members array validates each user exists and role is valid

### Task
- Title is required
- Status must be valid enum value
- Project reference must exist
- Assignee reference must exist (if provided)

### UserStory
- Story text is required
- ProjectId reference must exist
- Status must be valid enum value
- TaskId reference must exist (if converted)

## Sample Queries

### Get all projects with member details
```javascript
Project.find()
  .populate('members.user', 'name email role')
  .exec()
```

### Get all tasks for a project with assignee
```javascript
Task.find({ project: projectId })
  .populate('assignee', 'name email')
  .exec()
```

### Get user stories with converted tasks
```javascript
UserStory.find({ projectId })
  .populate('taskId')
  .exec()
```

### Get overdue tasks
```javascript
Task.find({
  deadline: { $lt: new Date() },
  status: { $ne: 'Done' }
})
.populate('project assignee')
.exec()
```

## Database Statistics (Example)

| Collection | Estimated Documents | Avg Size | Indexes |
|-----------|---------------------|----------|---------|
| users | 100 | 250 bytes | 2 |
| projects | 50 | 2 KB | 3 |
| tasks | 500 | 500 bytes | 5 |
| userstories | 200 | 400 bytes | 3 |

## Notes

1. **Soft Delete:** Consider implementing soft delete with `isDeleted: Boolean` field
2. **Audit Trail:** Add `createdBy` and `updatedBy` fields for tracking
3. **Versioning:** Consider using mongoose versioning for conflict resolution
4. **Transactions:** Use MongoDB transactions for operations affecting multiple collections
5. **Backup:** Regular backups recommended for production data
