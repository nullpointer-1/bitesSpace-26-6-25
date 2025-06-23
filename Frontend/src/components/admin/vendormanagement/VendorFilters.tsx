
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import VendorSearch from '../VendorSearch';
import { Vendor } from './types';

interface VendorFiltersProps {
  vendors: Vendor[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  locationFilter: string;
  setLocationFilter: (location: string) => void;
}

const VendorFilters: React.FC<VendorFiltersProps> = ({
  vendors,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  locationFilter,
  setLocationFilter,
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <VendorSearch
            vendors={vendors}
            onVendorSelect={(vendor) => {
              setSearchTerm(vendor.outletName);
            }}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          <select
            className="p-2 border rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <select
            className="p-2 border rounded-md"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="Healthy Food">Healthy Food</option>
            <option value="Fast Food">Fast Food</option>
            <option value="Cafe and Beverages">Cafe & Beverages</option>
            <option value="Multi Cuisine">Multi Cuisine</option>
            <option value="Snack and Refreshment">Snacks</option>
          </select>

          <select
            className="p-2 border rounded-md"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="all">All Locations</option>
            <option value="SRZ SDB Floor 1 Wing A">Floor 1 Wing A</option>
            <option value="SRZ SDB Floor 1 Wing B">Floor 1 Wing B</option>
            <option value="SRZ SDB2 Floor 2 Wing A">Floor 2 Wing A</option>
            <option value="SRZ SDB1 Floor 2 Wing B">Floor 2 Wing B</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorFilters;