// src/app/features/diagnostic/diagnostic.component.ts
import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InferenceService } from '../../core/services/inference.service';
import { FormConfigService } from '../../core/services/form-config.service';
import { Fact } from '../../core/models/fact.model';
import { InferenceResult } from '../../core/models/inference.model';
import { FormField } from '../../core/models/ui.model';

@Component({
    selector: 'app-diagnostic',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './diagnostic.component.html',
    styleUrls: ['./diagnostic.component.css']
})
export class DiagnosticComponent implements OnInit {
    diagnosticForm!: FormGroup;
    formFields: FormField[] = [];
    isAnalyzing = false;

    constructor(
        private inferenceService: InferenceService,
        private formConfigService: FormConfigService,
        private snackBar: MatSnackBar,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.formFields = this.formConfigService.getFormFields();
        this.diagnosticForm = this.formConfigService.createDiagnosticForm();
    }

    onSubmit(): void {
        if (this.diagnosticForm.valid) {
            this.isAnalyzing = true;

            const facts: Fact = this.diagnosticForm.value;
            this.inferenceService.infer(facts).subscribe({
                next: (result) => {
                    // Save the diagnostic case
                    this.inferenceService.saveCase(facts, result);

                    this.isAnalyzing = false;
                    this.showSuccessMessage(result);

                    // Navigate to results page with data
                    console.log('DIAGNOSTIC RESULT:', result);
                    this.router.navigate(['/results'], { state: { result, facts } });
                },
                error: (error) => {
                    console.error('Erreur lors de l\'inférence:', error);
                    this.isAnalyzing = false;
                    this.snackBar.open('Erreur lors de l\'analyse', 'Fermer', { duration: 3000 });
                }
            });
        } else {
            this.showValidationErrors();
        }
    }

    onReset(): void {
        this.diagnosticForm.reset();

        // Remettre les valeurs par défaut
        this.formFields.forEach(field => {
            const defaultValue = field.type === 'toggle' ? 0 :
                field.type === 'number' ? 0 :
                    field.options ? field.options[0].value : '';
            this.diagnosticForm.patchValue({ [field.key]: defaultValue });
        });
    }

    getFieldError(fieldKey: string): string | null {
        const control = this.diagnosticForm.get(fieldKey);
        if (control && control.errors && control.touched) {
            if (control.errors['required']) {
                return 'Ce champ est requis';
            }
            if (control.errors['min']) {
                return `Valeur minimale: ${control.errors['min'].min}`;
            }
            if (control.errors['max']) {
                return `Valeur maximale: ${control.errors['max'].max}`;
            }
        }
        return null;
    }



    private showSuccessMessage(result: InferenceResult): void {
        const actionCount = result.actions.length;
        this.snackBar.open(
            `Analyse terminée: ${actionCount} recommandation(s) générée(s)`,
            'Fermer',
            { duration: 3000 }
        );
    }

    private showValidationErrors(): void {
        this.snackBar.open(
            'Veuillez corriger les erreurs dans le formulaire',
            'Fermer',
            { duration: 3000 }
        );
    }




}
