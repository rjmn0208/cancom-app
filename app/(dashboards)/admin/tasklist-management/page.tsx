'use client'

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TaskList } from '@/lib/types'
import { createClient } from '@/utils/supabase/client'
import React, { useEffect, useState } from 'react'

const TaskListManagementPage = () => {
  const [taskLists, setTaskLists] = useState<TaskList[]>([])

  const fetchTaskLists = async () => {
    const supabase = createClient()

    const {data, error} = await supabase
    .from('TaskList')
    .select('*, Patient(*, User(*))')

    if(!error) setTaskLists(data)

  }

  useEffect(() => {
    fetchTaskLists()
  }, [])
  

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Patient</TableHead>
          <TableHead>Uncompleted Tasks</TableHead>
          <TableHead>Completed Tasks</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {taskLists.map((list: TaskList) => (
          <TableRow>
            <TableCell>{list.id}</TableCell>
            <TableCell>{list.Patient.User.firstName} {list.Patient.User.middleName} {list.Patient.User.lastName}</TableCell>
            <TableCell>{list.uncompletedTaskCount}</TableCell>
            <TableCell>{list.completedTaskCount}</TableCell>

          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default TaskListManagementPage