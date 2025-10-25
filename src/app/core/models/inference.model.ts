import { Fact } from './fact.model';

export interface Action {
    ruleId: string;
    type: string;
    msg: string;
    priority: number;
}

export interface InferenceResult {
    actions: Action[];
    firedRules: string[];
    timestamp?: Date;
}

export interface DiagnosticCase {
    id: string;
    facts: Fact;
    result: InferenceResult;
    createdAt: Date;
}