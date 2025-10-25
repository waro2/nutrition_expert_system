import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { DiagnosticComponent } from './diagnostic.component';
import { FormConfigService } from '../../core/services/form-config.service';
import { InferenceService } from '../../core/services/inference.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Fact } from '../../core/models/fact.model';
import { InferenceResult } from '../../core/models/inference.model';

const mockFacts: Fact = {
    NSS: 0,
    Peduca: 0,
    NI: 1,
    NAM: 2,
    AgeMere: 25,
    AAMA: 0,
    MAQA: 1,
    SML: 1
};

const mockResult: InferenceResult = {
    actions: [
        {
            ruleId: 'R1a',
            type: 'recommendation',
            msg: 'Recommander une première séance de sensibilisation pour améliorer les connaissances des mères.',
            priority: 90
        }
    ],
    firedRules: ['R1a'],
    timestamp: new Date()
};

describe('DiagnosticComponent (form submission)', () => {
    let component: DiagnosticComponent;
    let fixture: ComponentFixture<DiagnosticComponent>;
    let inferenceServiceSpy: jasmine.SpyObj<InferenceService>;

    beforeEach(async () => {
        inferenceServiceSpy = jasmine.createSpyObj('InferenceService', ['infer', 'saveCase']);
        inferenceServiceSpy.infer.and.returnValue(of(mockResult));

        await TestBed.configureTestingModule({
            imports: [
                DiagnosticComponent,
                MatSnackBarModule,
                RouterTestingModule
            ],
            providers: [
                FormConfigService,
                { provide: InferenceService, useValue: inferenceServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(DiagnosticComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should submit the form and display recommendations', fakeAsync(() => {
        component.diagnosticForm.setValue(mockFacts);
        expect(component.diagnosticForm.valid).toBeTrue();

        component.onSubmit();
        tick();

        expect(inferenceServiceSpy.infer).toHaveBeenCalledWith(mockFacts);
        expect(inferenceServiceSpy.saveCase).toHaveBeenCalled();
        expect(component.isAnalyzing).toBeFalse();
    }));
});
