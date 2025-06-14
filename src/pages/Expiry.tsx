
import React, { useEffect } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import ExpiryHeader from "@/components/expiry/ExpiryHeader";
import ExpiryStats from "@/components/expiry/ExpiryStats";
import ExpiryTable from "@/components/expiry/ExpiryTable";
import useAppStore from "@/store/appStore";

const Expiry = () => {
  const { loadProductExpiries } = useAppStore();

  useEffect(() => {
    // Load expiry data when component mounts
    loadProductExpiries();
  }, [loadProductExpiries]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Product Expiry</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <ExpiryHeader />

      {/* Stats Cards */}
      <ExpiryStats />

      {/* Expiry Table */}
      <ExpiryTable />
    </div>
  );
};

export default Expiry;
