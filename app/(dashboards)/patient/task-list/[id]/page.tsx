'use client'

import TaskListPage from '@/components/TaskListPage'
import React from 'react'

const PatientTaskListPage = ({ params }: { params: { id: string } }) => {

  return (
    <div>
      <TaskListPage taskListId={Number(params.id)}/>
    </div>
  )
}

export default PatientTaskListPage