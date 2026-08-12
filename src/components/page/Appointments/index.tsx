"use client";

import { useState } from "react";

import { useAppointmentsLogic } from "@/services/hooks/useAppointmentsLogic";
import { Appointment } from "@/services/types/appointment";

import { AppointmentsHeader, AppointmentsTable, AppointmentsTablePagination } from "./components";
import EditAppointmentModal from "./components/EditAppointmentModal";

interface Props {
  className?: string;
}

const Appointments: React.FC<Props> = ({ className }) => {
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const {
    data,
    isLoading,
    pagination,
    tableColumns,
    filters,
    itemsPerPageOptions,
    statusOptions,
    onFilterChange,
    onSortChange,
    onViewDetails,
  } = useAppointmentsLogic();

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      <AppointmentsHeader
        totalCount={pagination.total}
        filters={filters}
        statusOptions={statusOptions}
        onFilterChange={onFilterChange}
      />
      <AppointmentsTable
        data={data}
        isLoading={isLoading}
        tableColumns={tableColumns}
        filters={filters}
        onSortChange={onSortChange}
        onViewDetails={onViewDetails}
        onEdit={setEditingAppointment}
      />
      <AppointmentsTablePagination
        data={data}
        isLoading={isLoading}
        pagination={pagination}
        filters={filters}
        itemsPerPageOptions={itemsPerPageOptions}
        onFilterChange={onFilterChange}
      />
      <EditAppointmentModal appointment={editingAppointment} onClose={() => setEditingAppointment(null)} />
    </div>
  );
};

export default Appointments;
