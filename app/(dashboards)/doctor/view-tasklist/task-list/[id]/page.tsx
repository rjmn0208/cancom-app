import TaskListPage from '@/components/TaskListPage'
import { ListPermission } from '@/lib/types'
import { createClient } from '@/utils/supabase/server'
import React from 'react'

const DoctorTaskListPage = async ({ params }: { params: { id: string } }) => {
  const supabase = createClient()
  const {data: {user}} = await supabase.auth.getUser()

  const {data, error} = await supabase
  .from('ListMembership')
  .select('permission')
  .eq('userId', user?.id)
  .eq('taskListId', Number(params.id)) 
  .single()

  return (
    <div>
      <TaskListPage 
        taskListId={Number(params.id)}
        listPermission={data?.permission as ListPermission}
      />
    </div>
  )
}

export default DoctorTaskListPage