// src/app/features/history/history.component.ts
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { DiagnosticCase, Action } from '../../core/models/inference.model';
import { CaseDetailsDialogComponent } from './case-details-dialog.component';
import { InferenceService } from '../../core/services/inference.service';
import { FormConfigService } from '../../core/services/form-config.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-history',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatDialogModule,
        MatIconModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        ReactiveFormsModule
    ],
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit, AfterViewInit {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    displayedColumns: string[] = [
        'createdAt',
        'NSS',
        'AgeMere',
        'NI',
        'AAMA',
        'MAQA',
        'SML',
        'actionsCount',
        'rulesCount',
        'actions'
    ];

    dataSource = new MatTableDataSource<DiagnosticCase>([]);
    cases$: Observable<DiagnosticCase[]>;

    constructor(
        private inferenceService: InferenceService,
        private formConfigService: FormConfigService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {
        this.cases$ = this.inferenceService.getCases();
    }

    public datePipe = new DatePipe('fr-FR');

    ngOnInit(): void {
        this.cases$.subscribe(cases => {
            this.dataSource.data = cases;
        });
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    formatDate(date: Date): string {
        return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm') || '';
    }

    viewCaseDetails(caseItem: DiagnosticCase): void {
        const dialogRef = this.dialog.open(CaseDetailsDialogComponent, {
            width: '800px',
            data: caseItem
        });
    }

    deleteCase(caseItem: DiagnosticCase): void {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce cas ?')) {
            this.inferenceService.deleteCase(caseItem.id);
            this.snackBar.open('Cas supprimé avec succès', 'Fermer', {
                duration: 3000
            });
        }
    }

    exportCase(caseItem: DiagnosticCase): void {
        const data = {
            case: caseItem,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `case-${caseItem.id}.json`;
        link.click();

        window.URL.revokeObjectURL(url);

        this.snackBar.open('Cas exporté', 'Fermer', { duration: 2000 });
    }

    exportAllCases(): void {
        this.cases$.subscribe(cases => {
            if (cases.length === 0) {
                this.snackBar.open('Aucun cas à exporter', 'Fermer', { duration: 2000 });
                return;
            }

            const data = {
                cases,
                exportDate: new Date().toISOString(),
                totalCount: cases.length
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `all-cases-${Date.now()}.json`;
            link.click();

            window.URL.revokeObjectURL(url);

            this.snackBar.open(`${cases.length} cas exportés`, 'Fermer', {
                duration: 3000
            });
        });
    }

    clearAllCases(): void {
        const confirmMessage = 'Êtes-vous sûr de vouloir supprimer tous les cas ? Cette action est irréversible.';

        if (confirm(confirmMessage)) {
            // Supprimer tous les cas un par un
            this.dataSource.data.forEach(caseItem => {
                this.inferenceService.deleteCase(caseItem.id);
            });

            this.snackBar.open('Tous les cas ont été supprimés', 'Fermer', {
                duration: 3000
            });
        }
    }

    getStatusIcon(caseItem: DiagnosticCase): string {
        const criticalCount = caseItem.result.actions.filter((a: Action) => a.priority >= 90).length;
        if (criticalCount > 0) return 'error';

        const highCount = caseItem.result.actions.filter((a: Action) => a.priority >= 70).length;
        if (highCount > 0) return 'warning';

        return caseItem.result.actions.length > 0 ? 'info' : 'check_circle';
    }

    getStatusColor(caseItem: DiagnosticCase): string {
        const criticalCount = caseItem.result.actions.filter((a: Action) => a.priority >= 90).length;
        if (criticalCount > 0) return 'warn';

        const highCount = caseItem.result.actions.filter((a: Action) => a.priority >= 70).length;
        if (highCount > 0) return 'accent';

        return 'primary';
    }
}