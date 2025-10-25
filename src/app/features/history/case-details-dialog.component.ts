import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DiagnosticCase } from '../../core/models/inference.model';
import { FormConfigService } from '../../core/services/form-config.service';

@Component({
    selector: 'app-case-details-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatDividerModule,
        MatCardModule,
        MatChipsModule,
        MatIconModule,
        MatButtonModule
    ],
    templateUrl: './case-details-dialog.component.html',
    styleUrls: ['./case-details-dialog.component.css']
})
export class CaseDetailsDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: DiagnosticCase,
        private formConfigService: FormConfigService,
        private dialogRef: MatDialogRef<CaseDetailsDialogComponent>
    ) { }

    getNILabel(ni: number): string {
        const labels = ['Aucun', 'Primaire incomplet', 'Primaire complet', 'Secondaire', 'Supérieur'];
        return labels[ni] || 'Inconnu';
    }

    getPriorityColor(priority: number): string {
        return this.formConfigService.getPriorityColor(priority);
    }

    getPriorityLabel(priority: number): string {
        return this.formConfigService.getPriorityLabel(priority);
    }

    getActionTypeLabel(type: string): string {
        return this.formConfigService.getActionTypeLabels()[type] || type;
    }

    exportCase(): void {
        const data = {
            case: this.data,
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `case-${this.data.id}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.dialogRef.close();
    }
}
