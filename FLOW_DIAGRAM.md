# Indigenous Art Atlas - Website Flow Diagram

## User Journey Flowchart

```
                                    START
                                      |
                                      v
                            ┌─────────────────┐
                            │   Homepage      │
                            │   (index.html)  │
                            └─────────────────┘
                                      |
                    ┌─────────────────┴─────────────────┐
                    v                                   v
            ┌───────────────┐                  ┌────────────────┐
            │  Browse Art   │                  │  User Login?   │ ◇
            │ (browse.html) │                  └────────────────┘
            └───────────────┘                           |
                    |                          ┌────────┴────────┐
                    v                          v                 v
            ┌───────────────┐                [YES]             [NO]
            │  View Filters │                  |                 |
            │  - Art Type   │                  v                 v
            │  - Period     │          ┌──────────────┐   ┌─────────────┐
            │  - Region     │          │ Login Form   │   │  Register   │
            └───────────────┘          │(login.html)  │   │(register.html)│
                    |                  └──────────────┘   └─────────────┘
                    v                          |                 |
            ┌───────────────┐                  v                 v
            │ Select Artwork│          ┌──────────────────┐    ┌─────────┐
            │   from List   │          │ Validate Creds   │◇   │ Validate│◇
            └───────────────┘          └──────────────────┘    │  Form   │
                    |                          |                └─────────┘
                    v                    ┌─────┴─────┐               |
            ┌───────────────┐            v           v               v
            │  Art Detail   │        [VALID]    [INVALID]      [VALID/INVALID]
            │(art-detail.html)│          |           |               |
            └───────────────┘            v           v               v
                    |              ┌──────────┐  ┌────────┐    ┌──────────┐
                    |              │Set Session│ │ Error  │    │ Create   │
                    |              └──────────┘  │Message │    │ Account  │
                    v                    |       └────────┘    └──────────┘
            ┌───────────────┐            v                           |
            │  View Images  │      ┌──────────────┐                 v
            │  View Location│      │Is Admin User?│◇          ┌──────────┐
            │  View Details │      └──────────────┘           │Auto Login│
            └───────────────┘            |                    └──────────┘
                                   ┌─────┴─────┐                    |
                                   v           v                    v
                               [ADMIN]    [REGULAR]           ┌──────────┐
                                  |           |               │  SUCCESS │
                                  v           v               └──────────┘
                          ┌──────────┐  ┌─────────────┐
                          │  Admin   │  │  Dashboard  │
                          │  Panel   │  │(dashboard.html)│
                          │(admin.html)│ └─────────────┘
                          └──────────┘        |
                                |             v
                                |      ┌──────────────┐
                                |      │Submit Art?   │◇
                                |      └──────────────┘
                                |             |
                                |       ┌─────┴─────┐
                                |       v           v
                                |    [YES]        [NO]
                                |      |           |
                                |      v           v
                                | ┌─────────────┐  │
                                | │ Submit Art  │  │
                                | │ Form with   │  │
                                | │ Map Picker  │  │
                                | │(submit-art) │  │
                                | └─────────────┘  │
                                |      |           │
                                |      v           │
                                | ┌─────────────┐  │
                                | │ Upload Images│ │
                                | │Fill Metadata │ │
                                | └─────────────┘  │
                                |      |           │
                                |      v           │
                                | ┌─────────────┐  │
                                | │Submit to DB │  │
                                | │Status:      │  │
                                | │"Pending"    │  │
                                | └─────────────┘  │
                                |      |           │
                                v      v           v
                          ┌──────────────────────────┐
                          │  ADMIN PANEL FUNCTIONS   │
                          └──────────────────────────┘
                                      |
                    ┌─────────────────┼─────────────────┐
                    v                 v                 v
            ┌──────────────┐  ┌──────────────┐  ┌─────────────┐
            │View Pending  │  │ Manage Users │  │View Reports │
            │  Artworks    │  │              │  │             │
            └──────────────┘  └──────────────┘  └─────────────┘
                    |
                    v
            ┌──────────────┐
            │Review Artwork│
            │  Details     │
            └──────────────┘
                    |
                    v
            ┌──────────────┐
            │ Approve or   │◇
            │  Reject?     │
            └──────────────┘
                    |
            ┌───────┴────────┐
            v                v
        [APPROVE]        [REJECT]
            |                |
            v                v
    ┌────────────┐    ┌─────────────┐
    │Update DB:  │    │Update DB:   │
    │status =    │    │status =     │
    │'approved'  │    │'rejected'   │
    └────────────┘    └─────────────┘
            |                |
            v                v
    ┌────────────┐    ┌─────────────┐
    │Show on     │    │Notify User  │
    │Public Map  │    │via Dashboard│
    └────────────┘    └─────────────┘
            |                |
            └────────┬───────┘
                     v
            ┌─────────────────┐
            │  Continue or    │◇
            │     Logout?     │
            └─────────────────┘
                     |
            ┌────────┴────────┐
            v                 v
        [LOGOUT]         [CONTINUE]
            |                 |
            v                 |
    ┌────────────┐            │
    │Clear Session│           │
    │Redirect to │            │
    │  Homepage  │            │
    └────────────┘            │
            |                 │
            └────────┬────────┘
                     v
                    END
```

## Legend:
- `┌─────┐` Rectangle = Process/Page
- `◇` Diamond = Decision Point
- `→` Arrow = Flow Direction
- `[YES]/[NO]` = Decision Outcomes

## Key Decision Points:

1. **User Login Check** - Determines access to authenticated features
2. **Credential Validation** - Authenticates user login
3. **Admin User Check** - Routes to admin panel or user dashboard
4. **Submit Art Decision** - User chooses to submit or browse
5. **Approve/Reject Decision** - Admin moderates content

## Database Operations:

- **INSERT**: User registration, art submission
- **SELECT**: Browse artworks, view details, admin review
- **UPDATE**: Approve/reject artworks, update status
- **DELETE**: (Admin) Remove inappropriate content
