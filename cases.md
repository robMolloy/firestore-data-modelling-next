# Firestore Data Modelling Cases

This repo contains reference examples for modelling different types of data in a firestore project. All code is open source and contributions are welcome [https://github.com/robertmolloy/firestore-data-modelling-next](https://github.com/robertmolloy/firestore-data-modelling-next)

The easiest way to find the relevant code is to use the audit key to do a global search for the relevant case. For example, to find all the code for the case where a user can read/write to a doc in the todoGroups collection as long as their uid exists in the related todoGroups.uids field, you can search for `TG.C.6.D.wrongUserTodoGroup`.

## Standard

1. Any user can read docs from publicNotices collection
   - [x] get // PN.G
   - [x] list // PN.L
   - [x] create // PN.C
   - [x] update // PN.U
   - [x] delete // PN.D
2. Any logged in user can read the memberNotices collection
   - [x] get // MN.G
   - [x] list // MN.L
   - [x] create // MN.C
   - [x] update // MN.U
   - [x] delete // MN.D
3. Any logged in user can read/write a doc in the userTodos collection as long as the uid corresponds to the user's uid
   - [x] get // UT.G
   - [x] list // UT.L
   - [x] create // UT.C
   - [x] update // UT.U
   - [x] delete // UT.D
4. Any logged in user can read/write a doc in the todoGroups collection as long as their uid exists in the todoGroups.uids field
   - [x] get // TG.G
   - [x] list // TG.L
   - [x] create // TG.C
   - [x] update // TG.U
   - [x] delete // TG.D
5. Any logged in user can read/write a doc in the groupTodos collection as long as their uid exists in the referenced todoGroups.uids field
   - [x] get // GT.G
   - [x] list // GT.L
   - [x] create // GT.C
   - [x] update // GT.U
   - [x] delete // GT.D
6. The siteConfig collection which follows a singleDoc pattern can be read by any user and written to if empty or if the user is listed in the adminUids field
   - [x] get // SC.G
   - [x] list // SC.L
   - [x] create // SC.C
   - [x] update // SC.U
   - [x] delete // SC.D
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
