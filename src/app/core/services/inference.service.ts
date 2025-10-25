// src/app/core/services/inference.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, ReplaySubject, map } from 'rxjs';
import { Fact } from '../models/fact.model';
import { InferenceResult, DiagnosticCase, Action } from '../models/inference.model';

export interface Condition {
    var: keyof Fact;
    op: '=' | '!=' | '<' | '<=' | '>' | '>=' | 'in';
    val: any;
}

export interface Rule {
    id: string;
    when: Condition[];
    then: Partial<Action>[];
    priority: number;
    tags?: string[];
}

@Injectable({
    providedIn: 'root'
})
export class InferenceService {
    private rulesSubject = new ReplaySubject<Rule[]>(1);
    private rules$ = this.rulesSubject.asObservable();
    private casesSubject = new BehaviorSubject<DiagnosticCase[]>([]);
    public cases$ = this.casesSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadRules();
        this.loadCasesFromStorage();
    }

    private loadRules(): void {
        this.http.get<{ rules: Rule[] }>('assets/data/rules.json').subscribe({
            next: (data) => {
                this.rulesSubject.next(data.rules);
            },
            error: (error) => {
                console.error('Erreur lors du chargement des règles:', error);
                // Fallback to empty rules
                this.rulesSubject.next([]);
            }
        });
    }

    private evalCondition(facts: Fact, condition: Condition): boolean {
        const value = facts[condition.var as keyof Fact];

        switch (condition.op) {
            case "=":
                return value === condition.val;
            case "!=":
                return value !== condition.val;
            case "<":
                return value < condition.val;
            case "<=":
                return value <= condition.val;
            case ">":
                return value > condition.val;
            case ">=":
                return value >= condition.val;
            case "in":
                return Array.isArray(condition.val) && condition.val.includes(value);
            default:
                return false;
        }
    }

    public infer(facts: Fact): Observable<InferenceResult> {
        return this.rules$.pipe(
            map((rules: Rule[]) => {
                // Enhanced inference logic with conflict resolution and weighting
                const matchedRules = rules.filter((rule: Rule) =>
                    rule.when.every((condition: Condition) => this.evalCondition(facts, condition))
                );

                // Sort by priority descending
                matchedRules.sort((a: Rule, b: Rule) => b.priority - a.priority);

                // Group actions by type and resolve conflicts by highest priority
                const actionMap = new Map<string, Action>();

                matchedRules.forEach((rule: Rule) => {
                    rule.then.forEach((actionPartial: Partial<Action>) => {
                        const key = actionPartial.type + '|' + actionPartial.msg;
                        const existing = actionMap.get(key);
                        if (!existing || (existing.priority < rule.priority)) {
                            actionMap.set(key, {
                                ...actionPartial,
                                ruleId: rule.id,
                                priority: rule.priority
                            } as Action);
                        }
                    });
                });

                const actions = Array.from(actionMap.values());

                return {
                    actions,
                    firedRules: matchedRules.map((rule: Rule) => rule.id),
                    timestamp: new Date()
                };
            })
        );
    }

    public saveCase(facts: Fact, result: InferenceResult): void {
        const newCase: DiagnosticCase = {
            id: this.generateId(),
            facts,
            result,
            createdAt: new Date()
        };

        const currentCases = this.casesSubject.value;
        const updatedCases = [newCase, ...currentCases];
        this.casesSubject.next(updatedCases);
        this.saveCasesToStorage(updatedCases);
    }

    public getCases(): Observable<DiagnosticCase[]> {
        return this.cases$;
    }

    public deleteCase(id: string): void {
        const currentCases = this.casesSubject.value;
        const updatedCases = currentCases.filter(c => c.id !== id);
        this.casesSubject.next(updatedCases);
        this.saveCasesToStorage(updatedCases);
    }

    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    private loadCasesFromStorage(): void {
        try {
            const stored = localStorage.getItem('diagnostic-cases');
            if (stored) {
                const cases = JSON.parse(stored);
                this.casesSubject.next(cases);
            }
        } catch (error) {
            console.warn('Erreur lors du chargement de l\'historique:', error);
        }
    }

    private saveCasesToStorage(cases: DiagnosticCase[]): void {
        try {
            localStorage.setItem('diagnostic-cases', JSON.stringify(cases));
        } catch (error) {
            console.warn('Erreur lors de la sauvegarde:', error);
        }
    }

    public getRules(): Observable<Rule[]> {
        return this.rules$;
    }

    public getActionTypes(): Observable<string[]> {
        return this.rules$.pipe(
            map((rules: Rule[]) => {
                const types = new Set<string>();
                rules.forEach((rule: Rule) => {
                    rule.then.forEach((action: Partial<Action>) => {
                        if (action.type) types.add(action.type);
                    });
                });
                return Array.from(types);
            })
        );
    }
}