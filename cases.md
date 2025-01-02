# Firestore Data Modelling Cases

This repo contains reference examples for modelling different types of data in a firestore project. All code is open source and contributions are welcome [https://github.com/robertmolloy/firestore-data-modelling-next](https://github.com/robertmolloy/firestore-data-modelling-next)

The easiest way to find the relevant code is to use the audit key to do a global search for the relevant case. For example, to find all the code for the case where a user can read/write to a doc in the todoGroups collection as long as their uid exists in the related todoGroups.uids field, you can search for `TG.C.6.D.wrongUserTodoGroup`.

## Standard

1. Any user can read docs from publicNotices collection
   - [x] get
   - [x] list
   - [ ] ~~create~~ (not relevant)
   - [ ] ~~update~~ (not relevant)
   - [ ] ~~delete~~ (not relevant)
2. Any logged in user can read the memberNotices collection
   - [x] get // MN.G
   - [x] list // MN.L
   - [ ] ~~create~~ (not relevant)
   - [ ] ~~update~~ (not relevant)
   - [ ] ~~delete~~ (not relevant)
3. Any logged in user can read/write a doc in the userTodos collection as long as the uid corresponds to the user's uid
   - [x] get // UT.G
   - [x] list // UT.L
   - [x] create // UT.C
   - [x] update // UT.U
   - [x] delete // UT.D
4. Any logged in user can read/write a doc in the todoGroups collection as long as their uid exists in the todoGroups.uids field
   - [x] get // TG.G
   - [ ] list
   - [x] create // TG.C
   - [ ] update
   - [ ] delete
5. Any logged in user can read/write a doc in the groupTodos collection as long as their uid exists in the referenced todoGroups.uids field
   - [x] get // GT.G
   - [ ] list
   - [x] create // GT.C
   - [ ] update
   - [ ] delete
6. The siteConfig collection which follows a singleDoc pattern can be read by any user and written to if empty or if the user is listed in the adminUids field
   - [ ] get
   - [ ] list
   - [ ] create
   - [ ] update
   - [ ] delete
7. a user can read/write to any doc in the todoVersionHistory collection as long as their uid matches the uid field
   - [ ] get
   - [ ] list
   - [ ] create
   - [ ] update
   - [ ] delete
8. a user can read/write to a doc in the todoVersion collection as long as their uid matches the related todoVersionHistory.uid field and the id is correctly incremented
   - [ ] get
   - [ ] list
   - [ ] create
   - [ ] update
   - [ ] delete

## Progression - not implemented

1. adminUsers from the siteConfig collection can read/write to any todoGroup
