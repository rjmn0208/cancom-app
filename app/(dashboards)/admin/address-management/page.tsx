'use client'



import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Address } from '@/lib/types'
import { createClient } from '@/utils/supabase/client'
import { Pencil, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

const AddressManagementPage = () => {
  const [addresses, setAddresses] = useState<Address[]>([])

  const fetchAddresses = async () => {
    const supabase = createClient()
    const {data, error} = await supabase
    .from('Address')
    .select('*, User(*)')

    if(!error) setAddresses(data)
  }

  const handleOpenChange = async (open: boolean) => {
    if(!open){
      fetchAddresses()
    }
  }

  const handleAddressDelete = async (address: Address) => {
    const supabase = createClient()
    const {data, error} = await supabase
    .from('Address')
    .delete()
    .eq('id', address.id)

    fetchAddresses()
  }
  useEffect(() => {
    fetchAddresses()
  }, [])
  
  return (
    <div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead >ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Address Line One</TableHead>
              <TableHead>Address Line Two</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Postal Code</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addresses?.map((address: Address) => (
              <TableRow key={address.id}>
                <TableCell>{address.id}</TableCell>
                <TableCell> 
                  <div>{address.User?.firstName} {address.User?.middleName} {address.User?.lastName}</div>
                  <Badge>{address.User.userType}</Badge>
                </TableCell>
                <TableCell>{address.addressLineOne}</TableCell>
                <TableCell>{address.addressLineTwo}</TableCell>
                <TableCell>{address.city}</TableCell>
                <TableCell>{address.postalCode}</TableCell>
                <TableCell>{address.country}</TableCell>
                <TableCell>{address.country}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Dialog onOpenChange={(open) => handleOpenChange(open)}>                        
                      <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>  
                          <DialogTitle>Input Address Details</DialogTitle>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="icon" onClick={() => handleAddressDelete(address)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
    </div>
  )
}

export default AddressManagementPage