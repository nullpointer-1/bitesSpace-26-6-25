// src/components/admin/types.ts
// This file defines the TypeScript interfaces that mirror your Java DTOs for type safety.

// Updated Vendor interface to reflect what's returned by the backend's VendorDto,
// now including shop details. This is what `fetchVendors` will return.
export interface Vendor {
  id: number;
  name: string; // Vendor's actual personal name
  email: string;
  username: string;
  contactNumber: string;
  isActive: boolean; // Vendor's active status
  shopId: number | null;
  // password is NOT included here for security

  // NEW: Shop details, directly from the backend's enriched VendorDto
  shopName: string | null;     // Corresponds to Shop.name (Outlet Name)
  shopAddress: string | null;  // Corresponds to Shop.address (Location)
  shopCuisine: string | null;  // Corresponds to Shop.cuisine (Outlet Type)
  shopActive: boolean | null;  // Corresponds to Shop.active (Outlet Status)
}

// DTO for adding a new vendor (aligns with AddVendorDto.java),
// This is currently not used for the "Add New Outlet" flow, which uses ShopCreationRequest.
// It would be used if you had a separate endpoint to add a vendor to an *existing* shop.
export interface AddVendorRequest {
  name: string;
  email: string;
  username: string;
  password: string;
  contactNumber: string;
  isActive: boolean;
  shopId: number;
}

// DTO for updating an existing vendor (aligns with UpdateVendorDto.java)
export interface UpdateVendorRequest {
  id: number;
  name: string;
  email: string;
  username: string;
  password?: string;
  contactNumber: string;
  isActive: boolean;
  shopId: number | null;
}

// This interface directly mirrors your backend's ShopDto.java,
// which is used for creating a new Shop and its associated Vendor.
export interface ShopCreationRequest {
  // Shop fields
  id?: number; // Optional for creation, assigned by backend
  name: string; // Shop Name (Outlet Name)
  address: string; // Shop Address (Location)
  contactNumber: string; // Shop Contact Number
  cuisine: string; // Shop Cuisine (Outlet Type)
  isActive: boolean; // Shop Active status

  // Optional Shop fields
  imageUrl?: string | null;
  rating?: number | null;
  deliveryTime?: string | null;
  distance?: string | null;
  speciality?: string | null;
  isVeg?: boolean | null;
  featured?: boolean | null;

  // Nested Vendor fields (flat in the DTO as per your ShopDto.java)
  vendorId?: number | null; // Optional, will be assigned by backend
  vendorName: string; // Vendor's actual personal name
  vendorEmail: string;
  vendorUsername: string;
  vendorPassword: string; // Password is sent during creation
  vendorContactNumber: string;
}

// Interface for Product DTO if needed for product management within vendor context
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  rating: number;
  preparationTime: string;
  veg: boolean;
  available: boolean;
  ketoFriendly: boolean;
  highProtein: boolean;
  lowCarb: boolean;
  shopId: number;
}

// Define the shape of CredentialDto if used (for 'Send Credentials' action)
export interface Credential {
  username: string;
  password: string;
}