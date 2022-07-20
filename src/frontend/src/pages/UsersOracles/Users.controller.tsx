import React from 'react'
import UsersView from './Users.view'

import { usersData } from './users.const'

const Users = () => {
  return <UsersView users={usersData} />
}

export default Users
