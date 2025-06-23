import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import axiosInstance from '@/api/axiosInstance';
// Import only necessary types, particularly ShopCreationRequest for the combined form data
import { Vendor, UpdateVendorRequest, Credential, ShopCreationRequest } from './types';
import VendorStats from './VendorStats';
import VendorFilters from './VendorFilters';
import VendorsTable from './VendorsTable';
import AddVendorModal from './AddVendorModal'; // This is now used for adding both shop and vendor
import EditVendorModal from './EditVendorModal';
import ViewVendorModal from './ViewVendorModal';
import DeleteVendorModal from './DeleteVendorModal';
import CredentialsModal from './CredentialsModal';

// Updated fetchVendors to use the new /api/admin/vendors endpoint
// This now expects the enriched VendorDto from the backend
const fetchVendors = async (searchTerm: string, statusFilter: string, typeFilter: string, locationFilter: string): Promise<Vendor[]> => {
  const { data } = await axiosInstance.get('/admin/vendors', {
    params: {
      search: searchTerm || null,
      status: statusFilter === 'all' ? null : statusFilter,
      type: typeFilter === 'all' ? null : typeFilter,
      location: locationFilter === 'all' ? null : locationFilter,
    },
  });
  console.log("Fetched vendors data:", data);
  return data; // Backend returns List<VendorDto>, which now aligns with Vendor[]
};

const VendorManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [credentials, setCredentials] = useState<Credential>({ username: '', password: '' });

  // formData for AddVendorModal - directly maps to ShopCreationRequest (backend ShopDto)
  const [addFormData, setAddFormData] = useState<ShopCreationRequest>({
    name: '', // Outlet Name
    address: '', // Location
    contactNumber: '', // Outlet Contact
    cuisine: 'Healthy Food', // Outlet Type
    isActive: true, // Outlet Active
    vendorName: '', // Vendor Name
    vendorEmail: '',
    vendorUsername: '',
    vendorPassword: '',
    vendorContactNumber: '',
  });

  // formData for EditVendorModal - directly maps to UpdateVendorRequest
  const [editFormData, setEditFormData] = useState<UpdateVendorRequest>({
    id: 0, // Placeholder, will be set on edit
    name: '', // Vendor Name
    email: '',
    username: '',
    password: '',
    contactNumber: '',
    isActive: true,
    shopId: null,
  });


  const { data: vendors = [], isLoading: loadingVendors, isError } = useQuery<Vendor[]>({
    queryKey: ['vendors', searchTerm, statusFilter, typeFilter, locationFilter],
    queryFn: () => fetchVendors(searchTerm, statusFilter, typeFilter, locationFilter),
    initialData: [],
    refetchOnWindowFocus: false,
  });

  const invalidateVendorsQuery = () => {
    queryClient.invalidateQueries({ queryKey: ['vendors'] });
    // If you have a separate query for shops, you might want to invalidate that too:
    // queryClient.invalidateQueries({ queryKey: ['shops'] });
  };

  // Mutation for creating Shop and Vendor via combined ShopDto
  const addShopAndVendorMutation = useMutation({
    mutationFn: (payload: ShopCreationRequest) => axiosInstance.post('/admin/shops', payload),
    onSuccess: (response) => {
      toast({ title: "Success", description: `Outlet '${response.data.name}' and Vendor '${response.data.vendorName}' created successfully.` });
      invalidateVendorsQuery();
      setShowAddForm(false);
      // Reset form data after successful addition
      setAddFormData({
        name: '', address: '', contactNumber: '', cuisine: 'Healthy Food', isActive: true,
        vendorName: '', vendorEmail: '', vendorUsername: '', vendorPassword: '', vendorContactNumber: '',
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Outlet & Vendor",
        description: error.response?.data?.message || "Failed to create outlet and vendor.",
        variant: "destructive",
      });
    },
  });

  // Mutation for updating Vendor (does not update shop details in this implementation)
  const updateVendorMutation = useMutation({
    mutationFn: (payload: UpdateVendorRequest) =>
      axiosInstance.put(`/admin/vendors/${payload.id}`, payload),
    onSuccess: () => {
      invalidateVendorsQuery();
      setShowEditModal(false);
      setSelectedVendor(null);
      toast({ title: "Success", description: "Vendor updated successfully!" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update vendor.",
        variant: "destructive",
      });
    },
  });

  const deleteVendorMutation = useMutation({
    mutationFn: (vendorId: number) => axiosInstance.delete(`/admin/vendors/${vendorId}`),
    onSuccess: () => {
      invalidateVendorsQuery();
      setShowDeleteConfirm(false);
      setSelectedVendor(null);
      toast({ title: "Success", description: "Vendor deleted successfully!" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete vendor.",
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (vendorId: number) => {
      const vendorToToggle = vendors.find(v => v.id === vendorId);
      if (!vendorToToggle) {
        throw new Error("Vendor not found for status toggle.");
      }
      // Construct payload for UpdateVendorRequest
      const payload: UpdateVendorRequest = {
        id: vendorToToggle.id,
        name: vendorToToggle.name,
        email: vendorToToggle.email,
        username: vendorToToggle.username,
        contactNumber: vendorToToggle.contactNumber,
        isActive: !vendorToToggle.isActive, // Toggle vendor's active status
        shopId: vendorToToggle.shopId,
      };
      return axiosInstance.put(`/admin/vendors/${vendorId}`, payload);
    },
    onSuccess: () => {
      invalidateVendorsQuery();
      toast({ title: "Success", description: "Vendor status toggled successfully!" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to toggle vendor status.",
        variant: "destructive",
      });
    },
  });

  const sendCredentialsMutation = useMutation({
    mutationFn: (data: { id: number; credentials: Credential }) =>
      axiosInstance.post(`/admin/vendors/${data.id}/credentials`, data.credentials),
    onSuccess: () => {
      setShowCredentialsModal(false);
      toast({ title: "Success", description: "Credentials sent successfully to vendor's email!" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send credentials.",
        variant: "destructive",
      });
    },
  });

  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(v => v.isActive).length;
  const inactiveVendors = vendors.filter(v => !v.isActive).length;

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCredentials(prev => ({ ...prev, password }));
  };

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormData.name || !addFormData.address || !addFormData.contactNumber || !addFormData.cuisine ||
      !addFormData.vendorName || !addFormData.vendorEmail || !addFormData.vendorUsername ||
      !addFormData.vendorPassword || !addFormData.vendorContactNumber) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields for both Outlet and Vendor.",
        variant: "destructive",
      });
      return;
    }
    addShopAndVendorMutation.mutate(addFormData);
  };


  const handleUpdateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVendor) {
      // Create the payload from the current editFormData state
      const payload: UpdateVendorRequest = {
        ...editFormData, // This contains the ID and all other fields from the modal's current state
      };

      // IMPORTANT: Ensure isActive is explicitly a boolean before sending
      // This will convert null or undefined to false, and leave true/false as is.
      payload.isActive = !!payload.isActive;

      // If password is empty, remove it from the payload as per your backend DTO
      // (your DTO has 'password: String' not '@NotBlank', so empty string is OK,
      // but removing it is cleaner if backend expects null for no change)
      if (payload.password === '') {
        delete payload.password;
      }

      updateVendorMutation.mutate(payload);
    }
  };

  const sendCredentialsEmail = () => {
    if (selectedVendor) {
      sendCredentialsMutation.mutate({ id: selectedVendor.id, credentials });
    }
  };

  const handleDeleteVendor = () => {
    if (selectedVendor) {
      deleteVendorMutation.mutate(selectedVendor.id);
    }
  };

  // When opening the edit modal, set the formData for EditVendorModal
  const handleOpenEditModal = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setEditFormData({
      id: vendor.id,
      name: vendor.name,
      email: vendor.email,
      username: vendor.username,
      contactNumber: vendor.contactNumber,
      // Ensure isActive is always a boolean (true or false)
      isActive: vendor.isActive ?? false, // If vendor.isActive is null/undefined, default to false
      shopId: vendor.shopId,
      password: '',
    });
    setShowEditModal(true);
  };

  const handleOpenCredentialsModal = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setCredentials({ username: vendor.username, password: '' });
    generatePassword();
    setShowCredentialsModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddForm(false);
    // Reset addFormData to initial state
    setAddFormData({
      name: '', address: '', contactNumber: '', cuisine: 'Healthy Food', isActive: true,
      vendorName: '', vendorEmail: '', vendorUsername: '', vendorPassword: '', vendorContactNumber: '',
    });
  }

  useEffect(() => {
    if (vendors.length > 0) {
      console.log("Vendors data loaded:", vendors);
    } else if (!loadingVendors && !isError) {
      console.log("No vendors found.");
    }
  }, [vendors, loadingVendors, isError]);


  if (loadingVendors) {
    return <div className="text-center text-gray-500">Loading vendors...</div>;
  }

  if (isError) {
    return <div className="text-center text-red-500">Failed to load vendors. Please try again later.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Vendor Management</h1>
          <p className="text-gray-600">Manage food outlets and vendors</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Outlet
        </Button>
      </div>

      <VendorStats
        loadingVendors={loadingVendors}
        totalVendors={totalVendors}
        activeVendors={activeVendors}
        inactiveVendors={inactiveVendors}
      />

      <VendorFilters
        vendors={vendors}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
      />

      <VendorsTable
        vendors={vendors}
        loadingVendors={loadingVendors}
        onView={(vendor) => { setSelectedVendor(vendor); setShowViewModal(true); }}
        onEdit={handleOpenEditModal}
        onDelete={(vendor) => { setSelectedVendor(vendor); setShowDeleteConfirm(true); }}
        onGenerateCredentials={handleOpenCredentialsModal}
        onToggleStatus={(id) => toggleStatusMutation.mutate(id)}
      />

      {/* AddVendorModal now handles combined Shop+Vendor creation */}
      <AddVendorModal
        show={showAddForm}
        onClose={handleCloseAddModal}
        formData={addFormData}
        setFormData={setAddFormData}
        onSubmit={handleAddVendor}
        isPending={addShopAndVendorMutation.isPending}
      />

      {/* EditVendorModal now uses its own state and UpdateVendorRequest */}
      <EditVendorModal
        show={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedVendor(null); }}
        vendor={selectedVendor}
        formData={editFormData} // Pass editFormData
        setFormData={setEditFormData} // Pass setEditFormData
        onSubmit={handleUpdateVendor}
        isPending={updateVendorMutation.isPending}
      />

      <ViewVendorModal
        show={showViewModal}
        onClose={() => setShowViewModal(false)}
        vendor={selectedVendor}
      />

      <DeleteVendorModal
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteVendor}
        isPending={deleteVendorMutation.isPending}
        vendor={selectedVendor}
      />

      <CredentialsModal
        show={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        onConfirm={sendCredentialsEmail}
        isPending={sendCredentialsMutation.isPending}
        vendor={selectedVendor}
        credentials={credentials}
        generatePassword={generatePassword}
      />
    </div>
  );
};

export default VendorManagement;
