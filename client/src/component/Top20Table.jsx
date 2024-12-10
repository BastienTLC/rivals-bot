// src/pages/Customs/Top20Table.js
import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

function Top20Table({ top20 }) {
    return (
        <div className="card" style={{ width: '98%', margin: '0 auto' }}>
            <DataTable
                value={top20}
                responsiveLayout="scroll"
                stripedRows
                paginator
                rows={10}
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                rowsPerPageOptions={[10, 20, 50]}
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                sortMode="multiple"
            >
                <Column field="name" header="Joueur" sortable />
                <Column field="kills" header="Kills" sortable />
                <Column field="kdr" header="KD" sortable />
                <Column field="accuracy" header="Accuracy" sortable />
            </DataTable>
        </div>
    );
}

export default Top20Table;
