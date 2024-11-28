
import TaskListPage from '@/components/TaskListPage'
import { ListPermission } from '@/lib/types'
import React from 'react'

const PatientTaskListPage = async ({ params }: { params: { id: string } }) => {
  return (
    <div>
      <TaskListPage 
        taskListId={Number(params.id)}
        listPermission={ListPermission.MANAGER}
        />
    </div>
  )
}

export default PatientTaskListPage