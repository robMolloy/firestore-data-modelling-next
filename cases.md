1. Any user can read docs from publicNotices collection
2. Any logged in user can read the memberNotices collection
3. Any logged in user can read/write a doc in the userTodos collection as long as the uid corresponds to the user's uid
4. Any logged in user can read/write a doc in the groupTodos collection as long as the uid exists in the todoGroups collection in the uids field and the relevant doc has the groupId fieldAdd additional cases
5. The siteConfig collection which follows a singleDoc pattern can be written to if empty or if the user is listed in the adminUids field
6. adminUsers from the siteConfig collection can read/write to any todoGroup
7. Any user within the todosGroup can add a review in the groupTodoReviews as long as they didn't create the todoAdd more cases
8. version history
