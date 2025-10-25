import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InferenceService } from '../../core/services/inference.service';
import { InferenceResult } from '../../core/models/inference.model';
import { FormConfigService } from '../../core/services/form-config.service';
import { ActionGroup } from '../../core/models/ui.model';

@Component({
    selector: 'app-results',
    standalone: true,
    imports: [
        CommonModule,
        MatSnackBarModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './results.component.html',
    styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
    result: InferenceResult | null = null;
    facts: any = null;
    actionGroups: ActionGroup[] = [];

    constructor(
        private formConfigService: FormConfigService,
        private snackBar: MatSnackBar,
        private router: Router,
        private inferenceService: InferenceService
    ) { }

    ngOnInit(): void {
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras?.state) {
            this.result = navigation.extras.state['result'];
            this.facts = navigation.extras.state['facts'];
            if (this.result) {
                this.actionGroups = this.groupActionsByType(this.result.actions);
            }
        } else {
            // Si navigation par state échoue, récupérer le dernier diagnostic depuis l'historique
            this.inferenceService.getCases().subscribe((cases: any[]) => {
                if (cases.length > 0) {
                    this.result = cases[0].result;
                    this.facts = cases[0].facts;
                    if (this.result) {
                        this.actionGroups = this.groupActionsByType(this.result.actions);
                    }
                }
            });
        }
    }

    getPriorityColor(priority: number): string {
        return this.formConfigService.getPriorityColor(priority);
    }

    getPriorityLabel(priority: number): string {
        return this.formConfigService.getPriorityLabel(priority);
    }

    getActionTypeColor(type: string): string {
        return this.formConfigService.getActionTypeColor(type);
    }

    getActionTypeIcon(type: string): string {
        return this.formConfigService.getActionTypeIcon(type);
    }

    get actionTypeLabels() {
        return this.formConfigService.getActionTypeLabels();
    }

    private groupActionsByType(actions: any[]): ActionGroup[] {
        const groups = new Map<string, ActionGroup>();

        actions.forEach(action => {
            if (!groups.has(action.type)) {
                groups.set(action.type, {
                    type: action.type,
                    typeLabel: this.actionTypeLabels[action.type] || action.type,
                    actions: [],
                    priority: action.priority
                });
            }
            groups.get(action.type)!.actions.push(action);
        });

        return Array.from(groups.values()).sort((a, b) => b.priority - a.priority);
    }

    exportResults(): void {
        if (this.result && this.facts) {
            const data = {
                facts: this.facts,
                result: this.result,
                exportDate: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `diagnostic-${Date.now()}.json`;
            link.click();

            window.URL.revokeObjectURL(url);

            this.snackBar.open('Résultats exportés', 'Fermer', { duration: 2000 });
        }
    }

    getCriticalCount(actions: any[]): number {
        return actions.filter(a => a.priority >= 90).length;
    }

    exportSingleAction(action: any): void {
        const data = {
            action,
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `recommandation-${action.ruleId || 'action'}-${Date.now()}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Recommandation exportée', 'Fermer', { duration: 2000 });
    }
}
